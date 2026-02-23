import { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

function ScoreBar({ score }) {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
    return (
        <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
            <div
                className={`${color} h-4 rounded-full transition-all duration-700`}
                style={{ width: `${score}%` }}
            />
        </div>
    );
}

function FindingItem({ finding }) {
    const icon = finding.type === 'ok' ? '✓' : '⚠';
    const color = finding.type === 'ok' ? 'text-green-700 bg-green-50 border-green-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return (
        <div className={`flex gap-2 items-start p-2 rounded border text-sm ${color}`}>
            <span className="font-bold mt-0.5">{icon}</span>
            <div>
                <span className="font-semibold">{finding.field}: </span>
                {finding.message}
            </div>
        </div>
    );
}

function ScanResultCard({ scan }) {
    const [expanded, setExpanded] = useState(false);
    const statusColor = { completed: 'success', failed: 'error', pending: 'warning' };

    const docLabels = { aadhaar: 'Aadhaar Card', pan: 'PAN Card', '7-12': '7/12 Land Record', passbook: 'Bank Passbook' };

    return (
        <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="font-semibold text-sm">{docLabels[scan.documentType] || scan.documentType}</p>
                    <p className="text-xs text-gray-500">
                        {scan.scannedAt ? `Scanned: ${new Date(scan.scannedAt).toLocaleString()}` : 'Not yet scanned'}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Badge variant={statusColor[scan.scanStatus] || 'default'} size="sm">
                        {scan.scanStatus}
                    </Badge>
                    {scan.scanStatus === 'completed' && (
                        <span className="text-xs text-gray-600">{scan.confidence}% confidence</span>
                    )}
                </div>
            </div>

            {scan.scanStatus === 'completed' && Object.keys(scan.parsedFields || {}).length > 0 && (
                <div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        {expanded ? 'Hide extracted fields' : 'Show extracted fields'}
                    </button>
                    {expanded && (
                        <div className="mt-2 grid grid-cols-2 gap-1">
                            {Object.entries(scan.parsedFields).map(([key, value]) =>
                                value ? (
                                    <div key={key} className="bg-white p-1.5 rounded border text-xs">
                                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                                        <span className="font-medium">
                                            {key === 'aadhaarNumber' ? `****${value.slice(-4)}` : value}
                                        </span>
                                    </div>
                                ) : null
                            )}
                        </div>
                    )}
                </div>
            )}

            {scan.scanStatus === 'pending' && (
                <p className="text-xs text-yellow-700 mt-1">OCR scan in progress — refresh in a moment</p>
            )}
            {scan.scanStatus === 'failed' && (
                <p className="text-xs text-red-600 mt-1">Scan failed — document may be unreadable or low quality</p>
            )}
        </div>
    );
}

function FarmerAIReport({ farmerId }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [visible, setVisible] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/farmers/${farmerId}/report`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setReport(data);
                setVisible(true);
            } else {
                const err = await response.json();
                setError(err.message || 'Failed to generate report');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        if (!visible) {
            if (!report) {
                fetchReport();
            } else {
                setVisible(true);
            }
        } else {
            setVisible(false);
        }
    };

    const getRatingColor = (rating) => {
        const map = { High: 'success', Medium: 'warning', Low: 'error', 'Very Low': 'error' };
        return map[rating] || 'default';
    };

    return (
        <div className="mt-2">
            <Button
                variant={visible ? 'default' : 'primary'}
                onClick={handleToggle}
                disabled={loading}
            >
                {loading ? '⏳ Generating Report...' : visible ? '▲ Hide AI Report' : '🤖 Generate AI Summary Report'}
            </Button>

            {error && (
                <div className="mt-2 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
            )}

            {visible && report && (
                <div className="mt-4 space-y-4">
                    {/* Report Header */}
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">🤖 AI Farmer Summary Report</h2>
                                <p className="text-sm text-gray-600">
                                    Generated: {new Date(report.generatedAt).toLocaleString()}
                                </p>
                                <p className="text-lg font-semibold mt-1">{report.farmerName}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Reliability Score</p>
                                <div className="text-3xl font-bold text-gray-800">{report.reliabilityScore.score}/100</div>
                                <Badge variant={getRatingColor(report.reliabilityScore.rating)}>
                                    {report.reliabilityScore.rating} Reliability
                                </Badge>
                                <ScoreBar score={report.reliabilityScore.score} />
                            </div>
                        </div>
                    </Card>

                    {/* Document Status */}
                    <Card>
                        <h3 className="text-lg font-bold mb-3 border-b pb-2">📄 Document Status</h3>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-700">
                                    {report.documentStatus.completenessScore}%
                                </div>
                                <p className="text-sm text-gray-600">Completeness</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-700">
                                    {report.documentStatus.uploaded.length}
                                </div>
                                <p className="text-sm text-gray-600">Uploaded</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-700">
                                    {report.documentStatus.missingRequired.length}
                                </div>
                                <p className="text-sm text-gray-600">Missing Required</p>
                            </div>
                        </div>
                        {report.documentStatus.missingRequired.length > 0 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                <strong>Missing required documents:</strong>{' '}
                                {report.documentStatus.missingRequired.join(', ')}
                            </div>
                        )}
                    </Card>

                    {/* OCR Scan Results */}
                    {report.documentScanResults.length > 0 && (
                        <Card>
                            <h3 className="text-lg font-bold mb-3 border-b pb-2">🔍 Document Scan Results (OCR)</h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                {report.documentScanResults.map((scan) => (
                                    <ScanResultCard key={scan.documentType} scan={scan} />
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Cross-Validation Findings */}
                    {report.crossValidationFindings.length > 0 && (
                        <Card>
                            <h3 className="text-lg font-bold mb-3 border-b pb-2">🔎 Document Cross-Validation</h3>
                            <div className="space-y-2">
                                {report.crossValidationFindings.map((finding, i) => (
                                    <FindingItem key={i} finding={finding} />
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Crop Survey Summary */}
                    <Card>
                        <h3 className="text-lg font-bold mb-3 border-b pb-2">🌾 Crop Survey Summary</h3>
                        {report.cropSurveySummary.total === 0 ? (
                            <p className="text-gray-500 text-sm">No crop surveys on record</p>
                        ) : (
                            <div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div className="text-center p-2 bg-green-50 rounded">
                                        <div className="text-xl font-bold text-green-700">{report.cropSurveySummary.total}</div>
                                        <p className="text-xs text-gray-600">Total Surveys</p>
                                    </div>
                                    <div className="text-center p-2 bg-blue-50 rounded">
                                        <div className="text-xl font-bold text-blue-700">{report.cropSurveySummary.totalCultivatedArea} ha</div>
                                        <p className="text-xs text-gray-600">Total Area</p>
                                    </div>
                                    <div className="text-center p-2 bg-purple-50 rounded">
                                        <div className="text-xl font-bold text-purple-700">{report.cropSurveySummary.crops.length}</div>
                                        <p className="text-xs text-gray-600">Crop Types</p>
                                    </div>
                                    <div className="text-center p-2 bg-yellow-50 rounded">
                                        <div className="text-xl font-bold text-yellow-700">{report.cropSurveySummary.byStatus.verified || 0}</div>
                                        <p className="text-xs text-gray-600">Verified</p>
                                    </div>
                                </div>
                                {report.cropSurveySummary.latestSurveys.map((s) => (
                                    <div key={s.id} className="bg-gray-50 p-2 rounded text-sm mb-1 flex justify-between items-center">
                                        <span><strong>{s.cropName}</strong> — {s.season} {s.year}, {s.area} {s.unit}</span>
                                        <Badge variant={s.status === 'verified' ? 'success' : s.status === 'rejected' ? 'error' : 'warning'} size="sm">
                                            {s.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Loss Report Summary */}
                    <Card>
                        <h3 className="text-lg font-bold mb-3 border-b pb-2">⚠️ Loss Report Summary</h3>
                        {report.lossReportSummary.total === 0 ? (
                            <p className="text-gray-500 text-sm">No loss reports on record</p>
                        ) : (
                            <div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div className="text-center p-2 bg-red-50 rounded">
                                        <div className="text-xl font-bold text-red-700">{report.lossReportSummary.total}</div>
                                        <p className="text-xs text-gray-600">Total Reports</p>
                                    </div>
                                    <div className="text-center p-2 bg-orange-50 rounded">
                                        <div className="text-xl font-bold text-orange-700">{report.lossReportSummary.pendingCount}</div>
                                        <p className="text-xs text-gray-600">Pending Review</p>
                                    </div>
                                    <div className="text-center p-2 bg-yellow-50 rounded">
                                        <div className="text-xl font-bold text-yellow-700">₹{report.lossReportSummary.totalEstimatedLoss.toLocaleString()}</div>
                                        <p className="text-xs text-gray-600">Est. Loss</p>
                                    </div>
                                    <div className="text-center p-2 bg-green-50 rounded">
                                        <div className="text-xl font-bold text-green-700">₹{report.lossReportSummary.totalApprovedAmount.toLocaleString()}</div>
                                        <p className="text-xs text-gray-600">Approved</p>
                                    </div>
                                </div>
                                {report.lossReportSummary.recentReports.map((r) => (
                                    <div key={r.id} className="bg-gray-50 p-2 rounded text-sm mb-1 flex justify-between items-center">
                                        <span>
                                            <strong>{r.cropName}</strong> — {r.lossType}, {r.damagePercentage}% damage
                                        </span>
                                        <Badge variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'error' : 'warning'} size="sm">
                                            {r.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Officer Recommendations */}
                    <Card className="bg-blue-50 border border-blue-200">
                        <h3 className="text-lg font-bold mb-3 border-b border-blue-300 pb-2 text-blue-800">
                            📋 Officer Recommendations
                        </h3>
                        <ul className="space-y-2">
                            {report.recommendations.map((rec, i) => (
                                <li key={i} className="flex gap-2 text-sm text-blue-900">
                                    <span className="mt-0.5 font-bold">{i + 1}.</span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Score Breakdown */}
                    <Card>
                        <h3 className="text-lg font-bold mb-3 border-b pb-2">📊 Score Breakdown</h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                            {report.reliabilityScore.reasons.map((r, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                    <span className="text-green-600 font-mono">›</span>
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <div className="text-xs text-gray-400 text-right">
                        Report generated by ShetiSetu AI • {new Date(report.generatedAt).toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FarmerAIReport;
