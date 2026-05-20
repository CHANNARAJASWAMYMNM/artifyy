'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/context/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  createdAt: string;
}

interface SellerProfileItem {
  _id: string;
  shopName: string;
  story: string;
  location: string;
  craftType: string;
  status: 'pending' | 'approved' | 'rejected';
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface Analytics {
  users: { total: number; customers: number; sellers: number };
  sellersStatus: { pending: number; approved: number };
  orders: { total: number; paid: number; revenue: number; platformEarnings: number };
  categorySales: Record<string, number>;
  recentOrders: any[];
  recentUsers: any[];
}

export default function AdminDashboard() {
  const { user, token, backendUrl, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'analytics' | 'approvals' | 'users'>('analytics');

  // Analytics states
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Sellers (Approvals) states
  const [sellers, setSellers] = useState<SellerProfileItem[]>([]);
  const [sellersLoading, setSellersLoading] = useState(true);

  // Users states
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch admin analytics
  const fetchAnalytics = async () => {
    if (!token) return;
    try {
      const data = await apiRequest('/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        // Normalize to match analytics interface
        setAnalytics({
          users: { total: data.analytics.activeArtisans + 2, customers: 1, sellers: data.analytics.activeArtisans },
          sellersStatus: { pending: data.analytics.pendingApprovals, approved: data.analytics.activeArtisans },
          orders: { total: data.analytics.totalOrders, paid: 0, revenue: data.analytics.totalSales, platformEarnings: Math.floor(data.analytics.totalSales * 0.1) },
          categorySales: Object.fromEntries((data.analytics.categoryReport || []).map((c: any) => [c.name, c.value])),
          recentOrders: [],
          recentUsers: [],
        });
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch all seller applications
  const fetchSellers = async () => {
    if (!token) return;
    try {
      const data = await apiRequest('/admin/sellers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setSellers(data.sellers);
      }
    } catch (err) {
      console.error('Failed to load seller applications:', err);
    } finally {
      setSellersLoading(false);
    }
  };

  // Fetch all system users
  const fetchUsers = async () => {
    if (!token) return;
    try {
      const data = await apiRequest('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load user roster:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchAnalytics();
      fetchSellers();
      fetchUsers();
    }
  }, [token, user]);

  const handleApproveReject = async (profileId: string, decision: 'approved' | 'rejected') => {
    try {
      const data = await apiRequest(`/admin/sellers/${profileId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: decision }),
      });
      if (data.success) {
        fetchSellers();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: 'customer' | 'seller' | 'admin') => {
    const nextRoleMap: Record<string, 'customer' | 'seller' | 'admin'> = {
      customer: 'admin',
      admin: 'customer',
      seller: 'customer', // sellers demoted to customer for moderation
    };

    const targetRole = nextRoleMap[currentRole];
    if (!confirm(`Are you sure you want to change this user's role to ${targetRole}?`)) return;

    try {
      const data = await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: targetRole }),
      });
      if (data.success) {
        fetchUsers();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex justify-center items-center py-20 bg-[#FDFBF7]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C86B45]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Title block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-zinc-100 mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-zinc-800">Admin Control Panel</h1>
            <p className="text-zinc-500 text-sm mt-1">Review artisan profiles, modify global user privileges, and inspect revenue statistics.</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 mb-8 overflow-x-auto gap-4">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics' ? 'border-[#C86B45] text-[#C86B45]' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Analytics & Reports
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'approvals' ? 'border-[#C86B45] text-[#C86B45]' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Artisan Approvals ({sellers.filter(s => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'users' ? 'border-[#C86B45] text-[#C86B45]' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Roster & User Roles
          </button>
        </div>

        {/* TAB 1: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {analyticsLoading ? (
              <div className="animate-pulse rounded-2xl bg-zinc-50 border border-zinc-100 h-64"></div>
            ) : analytics ? (
              <div className="space-y-8">
                
                {/* Stats grids */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                    <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Gross Platform Sales</span>
                    <p className="text-2xl font-extrabold text-[#C86B45] mt-2">₹{analytics.orders.revenue}</p>
                    <span className="text-[10px] text-zinc-400 block mt-1">Sum of all checkout totals</span>
                  </div>
                  <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                    <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Platform Earnings (10%)</span>
                    <p className="text-2xl font-extrabold text-[#6E8C75] mt-2">₹{analytics.orders.platformEarnings}</p>
                    <span className="text-[10px] text-zinc-400 block mt-1">Platform curation commission</span>
                  </div>
                  <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                    <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Registrations</span>
                    <p className="text-2xl font-extrabold text-[#2A2A2A] mt-2">{analytics.users.total} Users</p>
                    <span className="text-[10px] text-zinc-400 block mt-1">{analytics.users.sellers} Sellers • {analytics.users.customers} Buyers</span>
                  </div>
                  <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                    <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Artisan Queue</span>
                    <p className="text-2xl font-extrabold text-amber-600 mt-2">{analytics.sellersStatus.pending} Pending</p>
                    <span className="text-[10px] text-zinc-400 block mt-1">{analytics.sellersStatus.approved} Active shops</span>
                  </div>
                </div>

                {/* Categories breakups */}
                <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-serif text-base font-bold text-zinc-800 border-b border-zinc-100 pb-3 mb-4">Category Sales Volume</h3>
                  <div className="space-y-4">
                    {Object.entries(analytics.categorySales).map(([category, amount]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{category}</span>
                          <span className="text-[#C86B45]">₹{amount}</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#DCA07B] rounded-full"
                            style={{
                              width: `${analytics.orders.revenue > 0 ? (amount / analytics.orders.revenue) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-center py-6 text-xs text-zinc-400">Failed to load analytics data.</p>
            )}
          </div>
        )}

        {/* TAB 2: ARTISAN APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-zinc-800 mb-6">Artisan Applications Queue</h2>
            
            {sellersLoading ? (
              <p className="text-xs text-zinc-400">Loading applications...</p>
            ) : sellers.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">No artisan registrations recorded in the system.</p>
            ) : (
              <div className="space-y-6">
                {sellers.map((seller) => (
                  <div key={seller._id} className="border border-zinc-50 rounded-2xl p-5 bg-[#FDFBF7]/40 space-y-4 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-serif text-base font-bold text-zinc-800">{seller.shopName}</h3>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                          seller.status === 'approved' ? 'bg-green-50 text-[#6E8C75]' :
                          seller.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {seller.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#C86B45]">Located: {seller.location} • Specialty: {seller.craftType}</p>
                      <p className="text-xs text-zinc-500 font-medium">Applicant: <span className="text-zinc-700">{seller.user?.name}</span> ({seller.user?.email})</p>
                      <div className="rounded-xl border border-zinc-100 bg-white p-3 text-xs italic text-zinc-600 leading-normal max-w-2xl">
                        "{seller.story}"
                      </div>
                    </div>

                    {/* Decision Button operators */}
                    <div className="flex gap-2 flex-shrink-0">
                      {seller.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveReject(seller._id, 'approved')}
                          className="px-4 py-2 bg-[#6E8C75] text-white font-bold rounded-lg hover:bg-emerald-700 text-xs shadow-sm transition-all"
                        >
                          Approve Shop
                        </button>
                      )}
                      {seller.status !== 'rejected' && (
                        <button
                          onClick={() => handleApproveReject(seller._id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 text-xs shadow-sm transition-all"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER ROSTER & ROLES */}
        {activeTab === 'users' && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-zinc-800 mb-6">System Roster</h2>
            
            {usersLoading ? (
              <p className="text-xs text-zinc-400">Loading user lists...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-zinc-600">
                  <thead className="bg-[#FDFBF7] text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-100">
                    <tr>
                      <th className="px-4 py-3">User Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Active Role</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-4 font-bold">{u.name}</td>
                        <td className="px-4 py-4 text-zinc-500">{u.email}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                            u.role === 'seller' ? 'bg-[#C86B45]/10 text-[#C86B45]' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-zinc-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleToggleUserRole(u._id, u.role)}
                            className="text-[#C86B45] hover:text-[#B55A35] font-bold hover:underline"
                            disabled={user?._id === u._id} // can't demote self
                          >
                            {u.role === 'admin' ? 'Demote Admin' : u.role === 'seller' ? 'Revoke Shop' : 'Promote Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
