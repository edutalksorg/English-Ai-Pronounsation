// src/pages/Settings/Coupons.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getAllCoupons, getCouponByCode, applyCoupon } from '@/lib/api/coupons';
import type { CouponDto } from '@/lib/api/generated/models/CouponDto';
import { Ticket, Copy, CheckCircle, Loader2, Search } from 'lucide-react';

export default function CouponsSettings() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CouponDto | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const result = await getAllCoupons(1, 50);
      setCoupons(result);
    } catch (err: any) {
      console.error('Failed to load coupons:', err);
      setCoupons([]);
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCoupon = (code: string | undefined) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: 'Copied',
      description: `Coupon code "${code}" copied to clipboard`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSearchCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a coupon code',
        variant: 'destructive',
      });
      return;
    }

    setSearching(true);
    try {
      const couponData = await getCouponByCode(couponCode.toUpperCase());

      if (couponData) {
        setSearchResults(couponData);
        toast({
          title: 'Success',
          description: `Coupon "${couponCode}" found`,
        });
      } else {
        setSearchResults(null);
        toast({
          title: 'Not Found',
          description: `Coupon "${couponCode}" not found or expired`,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchResults(null);
      toast({
        title: 'Error',
        description: 'Failed to search coupon',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a coupon code',
        variant: 'destructive',
      });
      return;
    }

    setApplyingCode(true);
    try {
      await applyCoupon({
        couponCode: couponCode.toUpperCase(),
        originalAmount: 0,
        itemType: 'Subscription',
      });

      toast({
        title: 'Success',
        description: `Coupon "${couponCode}" applied successfully`,
      });
      setCouponCode('');
      setSearchResults(null);
      await loadCoupons();
    } catch (err: any) {
      console.error('Apply error:', err);
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to apply coupon',
        variant: 'destructive',
      });
    } finally {
      setApplyingCode(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search/Apply Coupon Section */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search or Apply a Coupon Code
          </CardTitle>
          <CardDescription>Enter a coupon code to search and apply exclusive discounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter coupon code (e.g., WELCOME20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchCoupon()}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <Button
              onClick={handleSearchCoupon}
              disabled={searching || applyingCode}
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {searchResults && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Code:</span>
                  <span className="font-bold text-lg">{searchResults.code}</span>
                </div>
                {searchResults.description && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Description:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{searchResults.description}</span>
                  </div>
                )}
                {searchResults.discountType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Discount:</span>
                    <span className="font-semibold">
                      {searchResults.discountType === 'Percentage'
                        ? `${searchResults.discountValue}%`
                        : `₹${searchResults.discountValue}`}
                    </span>
                  </div>
                )}
                {searchResults.expiryDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Expires:</span>
                    <span className="text-sm">{new Date(searchResults.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
                <Button
                  onClick={handleApplyCoupon}
                  disabled={applyingCode}
                  className="w-full mt-3 bg-green-600 hover:bg-green-700"
                >
                  {applyingCode ? 'Applying...' : 'Apply This Coupon'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Coupons */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
          <p className="text-muted-foreground">Loading coupons...</p>
        </div>
      ) : coupons.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Available Coupons</h3>
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                        <Ticket className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{coupon.code}</h3>
                          {coupon.status && (
                            <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-semibold rounded">
                              {coupon.status}
                            </span>
                          )}
                        </div>
                        {coupon.description && (
                          <p className="text-sm text-muted-foreground mb-2">{coupon.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <span>
                            <strong>
                              {coupon.discountType === 'Percentage'
                                ? `${coupon.discountValue}%`
                                : `₹${coupon.discountValue}`}
                            </strong>{' '}
                            off
                          </span>
                          {coupon.expiryDate && (
                            <span className="text-muted-foreground">
                              Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                          {coupon.maxUsagePerUser && (
                            <span className="text-muted-foreground">Max uses: {coupon.maxUsagePerUser}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => coupon.code && handleCopyCoupon(coupon.code)}
                      className="flex-shrink-0 dark:border-gray-600 dark:text-gray-300"
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No available coupons at the moment</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
