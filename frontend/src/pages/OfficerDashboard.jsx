import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

function OfficerDashboard() {
    const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0, pendingEkyc: 0 });
    const [lossReports, setLossReports] = useState([]);
    const [panchanamas, setPanchanamas] = useState([]);
    const [pendingEkycFarmers, setPendingEkycFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all loss reports (not just submitted)
            const reportsRes = await fetch(`${API_URL}/loss-reports?limit=100`, {
                headers: getAuthHeaders(),
            });

            if (reportsRes.ok) {
                const data = await reportsRes.json();
                console.log('Loss reports data:', data);

                const allReports = data.results || [];
                const pendingReports = allReports.filter(r => r.status === 'submitted' || r.status === 'pending');
                const verifiedReports = allReports.filter(r => r.status === 'approved' || r.status === 'verified');
                const rejectedReports = allReports.filter(r => r.status === 'rejected');

                setLossReports(pendingReports);
                setStats({
                    pending: pendingReports.length,
                    verified: verifiedReports.length,
                    rejected: rejectedReports.length
                });
            } else {
                console.error('Failed to fetch loss reports:', reportsRes.status, await reportsRes.text());
            }

            // Fetch officer's panchanamas
            const panchanamasRes = await fetch(`${API_URL}/panchanamas`, {
                headers: getAuthHeaders(),
            });

            if (panchanamasRes.ok) {
                const data = await panchanamasRes.json();
                console.log('Panchanamas data:', data);
                setPanchanamas(data.results || []);
            } else {
                console.error('Failed to fetch panchanamas:', panchanamasRes.status);
            }

            // Fetch pending eKYC farmers
            const ekycRes = await fetch(`${API_URL}/farmers/pending-ekyc?limit=100`, {
                headers: getAuthHeaders(),
            });

            if (ekycRes.ok) {
                const data = await ekycRes.json();
                console.log('Pending eKYC farmers:', data);
                setPendingEkycFarmers(data.results || []);
                setStats(prev => ({ ...prev, pendingEkyc: (data.results || []).length }));
            } else {
                console.error('Failed to fetch pending eKYC:', ekycRes.status);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            submitted: 'bg-yellow-100 text-yellow-800',
            under_review: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            draft: 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
                {status?.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Officer Dashboard / अधिकारी डॅशबोर्ड
                    </h1>
                    <p className="text-gray-600 mt-1">Manage loss reports and field inspections</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <span>🔄</span> Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon="📋" label="Pending Cases" value={stats.pending} color="border-yellow-500" />
                <StatCard icon="✅" label="Verified" value={stats.verified} color="border-green-500" />
                <StatCard icon="❌" label="Rejected" value={stats.rejected} color="border-red-500" />
                <StatCard icon="📄" label="Pending eKYC" value={stats.pendingEkyc} color="border-blue-500" />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex border-b">
                    {['pending', 'ekyc', 'mycases'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab === 'pending' ? '📥 Pending Loss Reports' : tab === 'ekyc' ? '📄 eKYC Verification' : '📂 My Panchanamas'}
                            {tab === 'ekyc' && stats.pendingEkyc > 0 && (
                                <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                    {stats.pendingEkyc}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'pending' ? (
                        <div className="space-y-4">
                            {lossReports.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl block mb-2">📭</span>
                                    <p>No pending loss reports</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loss Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {lossReports.map((report) => (
                                                <tr key={report.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-sm">
                                                        {report.farmer?.id ? (
                                                            <Link
                                                                to={`/officer/farmer/${report.farmer.id}`}
                                                                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                            >
                                                                {report.farmer?.fullName || 'N/A'}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-900">{report.farmer?.fullName || 'N/A'}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600 capitalize">{report.lossType?.replace('_', ' ')}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{report.affectedArea} ha</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{formatDate(report.dateReported)}</td>
                                                    <td className="px-4 py-4">{getStatusBadge(report.status)}</td>
                                                    <td className="px-4 py-4">
                                                        <Link
                                                            to={`/officer/panchanama/new?lossReport=${report.id}`}
                                                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                                                        >
                                                            Start Inspection →
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'ekyc' ? (
                        <div className="space-y-4">
                            {pendingEkycFarmers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl block mb-2">✅</span>
                                    <p>No pending eKYC verifications</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {pendingEkycFarmers.map((farmer) => (
                                                <tr key={farmer.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-sm">
                                                        <Link
                                                            to={`/officer/farmer/${farmer.id}`}
                                                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                        >
                                                            {farmer.fullName}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {farmer.village}, {farmer.taluka}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {farmer.user?.mobile || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {formatDate(farmer.updatedAt)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            PENDING REVIEW
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Link
                                                            to={`/officer/farmer/${farmer.id}`}
                                                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                                                        >
                                                            Review Documents →
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {panchanamas.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl block mb-2">📋</span>
                                    <p>No panchanamas yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case #</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Damage %</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {panchanamas.map((pan) => (
                                                <tr key={pan.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-sm font-mono text-gray-900">{pan.caseNumber}</td>
                                                    <td className="px-4 py-4 text-sm">
                                                        {pan.farmer?.id ? (
                                                            <Link
                                                                to={`/officer/farmer/${pan.farmer.id}`}
                                                                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                            >
                                                                {pan.farmer?.fullName || 'N/A'}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-600">{pan.farmer?.fullName || 'N/A'}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{formatDate(pan.siteVisit?.scheduledDate)}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">{pan.damageAssessment?.damagePercentage || '-'}%</td>
                                                    <td className="px-4 py-4">{getStatusBadge(pan.status)}</td>
                                                    <td className="px-4 py-4">
                                                        <Link
                                                            to={`/officer/panchanama/${pan.id}`}
                                                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                                                        >
                                                            View Details →
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OfficerDashboard;
