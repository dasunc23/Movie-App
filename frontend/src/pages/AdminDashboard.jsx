import React, { useState, useEffect } from 'react';
import { Container } from '../components/layout/Container';
import { Card, Loader, Button } from '../components/common';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('Access denied. Admin only.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-black">
      <Container className="py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">
                {stats.stats.totalUsers}
              </div>
              <div className="text-sm text-gray-400">Total Users</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {stats.stats.totalMovies}
              </div>
              <div className="text-sm text-gray-400">Total Movies</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats.stats.totalRecommendations}
              </div>
              <div className="text-sm text-gray-400">Recommendations</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {stats.stats.totalWatchHistory}
              </div>
              <div className="text-sm text-gray-400">Watch History</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {stats.stats.totalWatchParties}
              </div>
              <div className="text-sm text-gray-400">Watch Parties</div>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">All Users</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-dark-border">
                    <td className="py-3 px-4 text-white">{user.name}</td>
                    <td className="py-3 px-4 text-gray-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {user.role !== 'admin' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default AdminDashboard;