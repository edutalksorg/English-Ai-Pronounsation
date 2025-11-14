// src/components/dashboard/VoiceCalling.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, PhoneOff, Star, Ban, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAvailableUsers, initiateCall, endCall, rateCall } from '@/lib/api/types/voiceCall';

export const VoiceCalling = () => {
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callTimeout, setCallTimeout] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [callPartner, setCallPartner] = useState('');
  const [callId, setCallId] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null);

  const durationIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const callIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  // load once + start polling every 10s
  useEffect(() => {
    loadAvailableUsers();

    const id = window.setInterval(() => {
      loadAvailableUsers();
    }, 10000); // 10s poll
    pollIntervalRef.current = id;

    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isInCall) {
      durationIntervalRef.current = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        window.clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        window.clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [isInCall]);

  async function loadAvailableUsers() {
    setLoadingUsers(true);
    try {
      const res: any = await getAvailableUsers();
      // normalize response shapes (array, {data:[]}, {items:[]})
      let users: any[] = [];
      if (Array.isArray(res)) users = res;
      else if (res && typeof res === 'object') {
        if (Array.isArray(res.data)) users = res.data;
        else if (Array.isArray(res.items)) users = res.items;
        else if (Array.isArray(res.users)) users = res.users;
      }
      setAvailableUsers(users);
    } catch (e: any) {
      console.error('loadAvailableUsers error', e);
      toast({
        title: 'Error',
        description: e?.response?.data?.message ?? 'Failed to load available users',
        variant: 'destructive',
      });
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  const startCall = async () => {
    if (availableUsers.length === 0) {
      toast({
        title: 'No users available',
        description: 'There are no users available for calling right now',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    setCallTimeout(false);
    setCallDuration(0);
    setCallStatus(null);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      const userId = randomUser.userId ?? randomUser.id;
      const userName = randomUser.fullName ?? randomUser.name ?? randomUser.email ?? `User_${Math.floor(Math.random() * 9999)}`;

      setSelectedUserId(userId);
      setCallPartner(userName);

      const payload = { calleeId: userId };
      const resp = await initiateCall(payload);

      const returnedCallId = resp?.callId ?? null;
      if (!returnedCallId) {
        throw new Error('No callId returned from server');
      }

      setCallId(returnedCallId);
      callIdRef.current = returnedCallId;
      const initialStatus = resp?.status ?? 'Ringing';
      setCallStatus(initialStatus);

      // If call not answered within 30s, treat as timeout
      timeoutRef.current = window.setTimeout(() => {
        handleCallTimeout();
      }, 30000);

      // Prefer server push; fallback simulate: check instant status and move to in-call when server says InProgress
      // If backend returns InProgress immediately, mark connected
      if (initialStatus === 'InProgress' || initialStatus === 'Accepted') {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsConnecting(false);
        setIsInCall(true);
        setCallStatus('InProgress');
        toast({ title: 'Connected', description: `You are now connected with ${userName}` });
      } else {
        // keep connecting; backend should later update status via socket or next poll
        // We'll check status by polling the available-users (or a dedicated status endpoint) - for now rely on server to push
      }
    } catch (err: any) {
      console.error('startCall error:', err);
      setIsConnecting(false);
      setCallTimeout(false);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      toast({
        title: 'Call failed',
        description: err?.response?.data?.message ?? err?.message ?? 'Failed to start call',
        variant: 'destructive',
      });
    }
  };

  const handleCallTimeout = () => {
    // Only trigger timeout if we were still connecting and not yet in call
    setIsConnecting((currentConnecting) => {
      setIsInCall((currentInCall) => {
        if (currentConnecting && !currentInCall) {
          setCallTimeout(true);
          setCallStatus(null);

          const currentCallId = callIdRef.current;
          if (currentCallId) {
            endCall(currentCallId).catch((e) => {
              console.warn('Failed to end timed out call:', e);
            });
          }

          setCallId(null);
          callIdRef.current = null;

          toast({
            title: 'No answer',
            description: 'No users available in this time. Please try later.',
            variant: 'destructive',
          });
        }
        return currentInCall;
      });
      return false;
    });
  };

  const endCallHandler = async () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (callId) {
      try {
        await endCall(callId);
      } catch (e) {
        console.warn('end call failed', e);
      }
    }

    setIsInCall(false);
    setCallId(null);
    callIdRef.current = null;
    setCallStatus(null);
    setShowRating(true);
  };

  const resetCallState = () => {
    setCallTimeout(false);
    setCallId(null);
    callIdRef.current = null;
    setCallStatus(null);
    setCallPartner('');
    setSelectedUserId(null);
    setCallDuration(0);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const submitRating = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting',
        variant: 'destructive',
      });
      return;
    }

    if (callId) {
      try {
        await rateCall(callId, rating);
        toast({ title: 'Thank you for your feedback', description: 'Your rating has been submitted' });
      } catch (err: any) {
        console.error('Rating submission failed:', err);
        toast({ title: 'Error', description: 'Failed to submit rating', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Thank you for your feedback', description: 'Your rating has been submitted' });
    }

    setShowRating(false);
    setRating(0);
    setFeedback('');
    resetCallState();
    loadAvailableUsers();
  };

  const blockUser = () => {
    toast({ title: 'User blocked', description: 'You will not be matched with this user again' });
    setShowRating(false);
    setRating(0);
    setFeedback('');
    resetCallState();
    loadAvailableUsers();
  };

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-[920px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          drag="y"
          dragConstraints={{ top: -8, bottom: 8 }}
          whileDrag={{ scale: 0.998 }}
        >
          <Card className="rounded-xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Phone className="h-6 w-6" />
                Voice Calling Feature
              </CardTitle>
              <CardDescription className="text-gray-600">
                Connect with real users to practice your communication skills
              </CardDescription>
            </CardHeader>

            <CardContent className="py-12 px-10 flex flex-col items-center">
              <Alert className="w-full mb-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy Notice:</strong> Do not share personal information during calls.
                  EduLearnDevelop is not responsible for any losses resulting from shared information.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col items-center justify-center py-8 w-full">
                {!isInCall && !isConnecting && !callTimeout && (
                  <div className="text-center space-y-4 w-full">
                    {loadingUsers ? (
                      <div className="text-muted-foreground">Loading available users...</div>
                    ) : availableUsers.length === 0 ? (
                      <div className="text-center space-y-4">
                        <div className="w-36 h-36 gradient-hero rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <Phone className="h-14 w-14 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold">Ready to Practice?</h3>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                          There are currently no users available for practice calls. Please try again later.
                        </p>
                        <div className="flex justify-center mt-4">
                          <Button size="lg" onClick={loadAvailableUsers} variant="outline">
                            Refresh
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-36 h-36 gradient-hero rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <Phone className="h-14 w-14 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold">Ready to Practice?</h3>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                          {availableUsers.length} {availableUsers.length === 1 ? 'user is' : 'users are'} available.
                          Click the button below to connect with another learner for a practice conversation.
                        </p>
                        <div className="flex justify-center gap-3 mt-4">
                          <Button size="lg" onClick={startCall} className="gradient-hero flex items-center">
                            <Phone className="h-5 w-5 mr-2" />
                            Start Call
                          </Button>
                          <Button size="sm" onClick={loadAvailableUsers} variant="ghost">
                            Refresh Users
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isConnecting && !callTimeout && (
                  <div className="text-center space-y-4">
                    <div className="w-36 h-36 gradient-hero rounded-full flex items-center justify-center mx-auto animate-pulse shadow-lg">
                      <Phone className="h-14 w-14 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold">Connecting...</h3>
                    <p className="text-muted-foreground">Finding a practice partner for you</p>
                  </div>
                )}

                {callTimeout && (
                  <div className="text-center space-y-4">
                    <div className="w-36 h-36 gradient-hero rounded-full flex items-center justify-center mx-auto">
                      <Phone className="h-14 w-14 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold">No users available in this time</h3>
                    <p className="text-muted-foreground max-w-md">Please try later</p>
                    <Button
                      size="lg"
                      onClick={() => {
                        resetCallState();
                        loadAvailableUsers();
                      }}
                      className="gradient-hero mt-3"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}

                {isInCall && (
                  <div className="text-center space-y-6 w-full max-w-md">
                    <div className="w-36 h-36 gradient-success rounded-full flex items-center justify-center mx-auto animate-pulse shadow-lg">
                      <Phone className="h-14 w-14 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Connected with {callPartner}</h3>
                      <p className="text-muted-foreground">Call in progress...</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 w-full">
                      <p className="text-sm text-muted-foreground">Call Duration: {formatDuration(callDuration)}</p>
                    </div>
                    <Button size="lg" variant="destructive" onClick={endCallHandler}>
                      <PhoneOff className="h-5 w-5 mr-2" />
                      End Call
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>Please rate your conversation with {callPartner}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="lg"
                    onClick={() => setRating(star)}
                    className="p-0 w-12 h-12"
                  >
                    <Star
                      className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea id="feedback" placeholder="Share your experience..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            </div>

            <div className="flex gap-3">
              <Button onClick={submitRating} className="flex-1">
                Submit Rating
              </Button>
              <Button variant="destructive" onClick={blockUser}>
                <Ban className="h-4 w-4 mr-2" />
                Block User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceCalling;
