// src/pages/user/Coupons.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CouponService } from "@/lib/api/generated/services/CouponService";
import { WalletService } from "@/lib/api/generated/services/WalletService";
import type { CouponDto } from "@/lib/api/generated/models/CouponDto";
import { Ticket, Copy, CheckCircle, Loader } from "lucide-react";

export default function CouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCode, setApplyingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<CouponDto | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCouponsForUser();
  }, []);

  const loadCouponsForUser = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load user's applied/active coupons from API
      const result = await CouponService.getApiV1Coupons(1, 50);
      setCoupons(result || []);
    } catch (err: any) {
      console.error("Failed to load coupons:", err);
      setCoupons([]);
      const errMsg = err?.response?.data?.message || "Failed to load coupons. Please try again.";
      setError(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
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
      title: "Copied",
      description: `Coupon code "${code}" copied to clipboard`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSearchCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      const couponData = await CouponService.getApiV1Coupons1(couponCode.toUpperCase());

      if (couponData) {
        setSearchResults(couponData);
        toast({
          title: "Success",
          description: `Coupon "${couponCode}" found`,
        });
      } else {
        setSearchResults(null);
        toast({
          title: "Not Found",
          description: `Coupon "${couponCode}" not found or expired`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setSearchResults(null);
      toast({
        title: "Error",
        description: err?.response?.data?.message ?? "Coupon not found",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setApplyingCode(true);
    try {
      const result = await CouponService.postApiV1CouponsApply({
        couponCode: couponCode.toUpperCase(),
        originalAmount: 0,
        itemType: "Subscription",
      });

      toast({
        title: "Success",
        description: `Coupon "${couponCode}" applied successfully`,
      });
      setCouponCode("");
      setSearchResults(null);
      
      // Refresh coupons list and wallet to reflect changes
      await loadCouponsForUser();
      
      // Optionally refresh wallet balance (if coupon added funds)
      try {
        await WalletService.getApiV1WalletBalance();
      } catch (err) {
        console.warn("Failed to refresh wallet balance:", err);
      }
    } catch (err: any) {
      console.error("Apply error:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message ?? "Failed to apply coupon",
        variant: "destructive",
      });
    } finally {
      setApplyingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Coupon Codes</h1>
          <p className="text-muted-foreground">Search and apply coupon codes to get exclusive discounts</p>
        </div>

        {/* Error Banner */}
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-red-800 dark:text-red-200">{error}</p>
                <Button
                  onClick={loadCouponsForUser}
                  size="sm"
                  className="ml-2"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search/Apply Coupon Section */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Search or Apply a Coupon Code</CardTitle>
            <CardDescription>Enter your coupon code to search and apply exclusive discounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter coupon code (e.g., WELCOME20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchCoupon()}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <Button
                onClick={handleSearchCoupon}
                disabled={searching || applyingCode}
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300"
              >
                {searching ? <Loader className="h-4 w-4 animate-spin" /> : "Search"}
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
                        {searchResults.discountType === "Percentage"
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
                    {applyingCode ? "Applying..." : "Apply This Coupon"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currently Applied/Active Coupons */}
        {coupons.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Active Coupons</h2>
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
                            <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-semibold rounded">
                              Active
                            </span>
                          </div>
                          {coupon.description && (
                            <p className="text-sm text-muted-foreground mb-2">{coupon.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              <strong>
                                {coupon.discountType === "Percentage"
                                  ? `${coupon.discountValue}%`
                                  : `₹${coupon.discountValue}`}
                              </strong>{" "}
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
        )}

        {loading ? (
          <div className="text-center py-12">
            <Loader className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="text-muted-foreground mt-2">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 && !searchResults ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No active coupons. Search for a code above to apply one!</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
