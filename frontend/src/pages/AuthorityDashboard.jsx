import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000/v1';

function AuthorityDashboard() {
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [stats, setStats] = useState(null);
    const [districtStats, setDistrictStats] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();

            const [overviewRes, districtRes, performanceRes, trendsRes, approvalsRes] = await Promise.all([
                fetch(`${API_URL}/analytics/overview`, { headers }),
                fetch(`${API_URL}/analytics/district-stats`, { headers }),
                fetch(`${API_URL}/analytics/officer-performance`, { headers }),
                fetch(`${API_URL}/analytics/compensation-trends`, { headers }),
                fetch(`${API_URL}/panchanamas/all?status=submitted`, { headers })
            ]);

            if (overviewRes.ok) setStats(await overviewRes.json());
            if (districtRes.ok) setDistrictStats(await districtRes.json());
            if (performanceRes.ok) setPerformance(await performanceRes.json());
            if (trendsRes.ok) setTrends(await trendsRes.json());
            if (approvalsRes.ok) {
                const data = await approvalsRes.json();
                setPendingApprovals(data.results || []);
            }

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, decision, remarks = '') => {
        if (!window.confirm(`Are you sure you want to ${decision} this panchanama?`)) return;

        try {
            setReviewing(id);
            const res = await fetch(`${API_URL}/panchanamas/${id}/review`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ decision, remarks: remarks || `${decision} by authority` })
            });

            if (res.ok) {
                alert(`Panchanama ${decision} successfully`);
                fetchData(); // Refresh list
            } else {
                alert('Failed to submit review');
            }
        } catch (error) {
            console.error('Error reviewing:', error);
            alert('Error submitting review');
        } finally {
            setReviewing(null);
        }
    };

    const StatCard = ({ icon, label, value, color }) => (
        <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <span className="text-4xl opacity-80">{icon}</span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Authority Dashboard / प्राधिकरण डॅशबोर्ड
                    </h1>
                    <p className="text-gray-600 mt-1">State-level overview and governance</p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <span>🔄</span> Refresh Data
                </button>
            </div>

            {/* Pending Approvals Section - STEP 4 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
                <div className="p-6 border-b border-gray-100 bg-blue-50">
                    <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        <span>⚖️</span> Pending Approvals (Step 4)
                    </h2>
                    <p className="text-sm text-blue-600">Review and approve submitted panchanamas</p>
                </div>

                {pendingApprovals.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No pending approvals. All caught up! ✅</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Damage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rec. Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pendingApprovals.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-900">{item.caseNumber}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.farmer?.personalDetails?.firstName} {item.farmer?.personalDetails?.lastName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.damageAssessment?.damagePercentage}% ({item.damageAssessment?.causeOfDamage})
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                                            ₹{item.recommendedAmount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleReview(item.id, 'approved')}
                                                    disabled={reviewing === item.id}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReview(item.id, 'rejected')}
                                                    disabled={reviewing === item.id}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Overview Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        icon="👨‍🌾"
                        label="Total Farmers"
                        value={stats.farmers}
                        color="border-green-500"
                    />
                    <StatCard
                        icon="📋"
                        label="Loss Reports"
                        value={stats.totalLossReports}
                        color="border-yellow-500"
                    />
                    <StatCard
                        icon="✅"
                        label="Inspections Done"
                        value={stats.completedInspections}
                        color="border-blue-500"
                    />
                    <StatCard
                        icon="💰"
                        label="Disbursed (₹)"
                        value={`₹${(stats.totalDisbursed / 10000000).toFixed(2)} Cr`}
                        color="border-purple-500"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* District Stats */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">District-wise Impact</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reports</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Area (ha)</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {districtStats.map((d) => (
                                    <tr key={d._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{d._id}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{d.totalReports}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{d.totalArea.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-sm text-yellow-600 font-medium">{d.pending}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Officer Performance */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Officer Performance</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Officer</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inspections</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approval Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {performance.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{p.totalInspections}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500"
                                                        style={{ width: `${p.approvedRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-gray-600">{Math.round(p.approvedRate)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthorityDashboard;
