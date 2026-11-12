import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, AlertOctagon, Calendar, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { ExpiryAlert } from '../types';
import { api } from '../services/api';

interface ExpiryDashboardProps {
  onOpenDocument: (docId: string) => void;
}

export const ExpiryDashboard: React.FC<ExpiryDashboardProps> = ({ onOpenDocument }) => {
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'valid' | 'expired'>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getExpiryAlerts();
      setAlerts(res.alerts || []);
    } catch (err) {
      console.error('Failed to load expiry alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'urgent') return ['expiring_1', 'expiring_7', 'expiring_15'].includes(a.status);
    if (filter === 'expired') return a.status === 'expired';
    if (filter === 'valid') return a.status === 'valid' || a.status === 'expiring_30';
    return true;
  });

  const getStatusBadge = (status: ExpiryAlert['status'], days: number) => {
    if (status === 'expired') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Expired ({Math.abs(days)}d ago)</span>
        </span>
      );
    }
    if (status === 'expiring_1') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Expires in 1 day!</span>
        </span>
      );
    }
    if (status === 'expiring_7') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Expires in {days} days</span>
        </span>
      );
    }
    if (status === 'expiring_15' || status === 'expiring_30') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300">
          <Clock className="w-3.5 h-3.5" />
          <span>Renewal in {days} days</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Valid ({days}d left)</span>
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4">
          <span className="text-[11px] text-[#9299A5] block">Total Tracked</span>
          <span className="text-2xl font-bold font-mono text-[#F4F5F7] mt-1 block">
            {alerts.length}
          </span>
        </div>
        <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4">
          <span className="text-[11px] text-[#9299A5] block">Urgent Renewals</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
            {alerts.filter(a => ['expiring_1', 'expiring_7', 'expiring_15'].includes(a.status)).length}
          </span>
        </div>
        <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4">
          <span className="text-[11px] text-[#9299A5] block">Expired</span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
            {alerts.filter(a => a.status === 'expired').length}
          </span>
        </div>
        <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-4">
          <span className="text-[11px] text-[#9299A5] block">Healthy / Valid</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {alerts.filter(a => a.status === 'valid' || a.status === 'expiring_30').length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex p-1 bg-[#171A20] rounded-xl border border-[#222630] text-xs">
          {(['all', 'urgent', 'valid', 'expired'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-medium rounded-lg capitalize transition-all ${
                filter === f ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={loadAlerts}
          className="p-2 text-[#9299A5] hover:text-[#F4F5F7] bg-[#171A20] hover:bg-[#222630] border border-[#222630] rounded-xl transition-colors"
          title="Refresh alerts"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-[#9299A5]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#648BFF] mb-2" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-[#171A20] border border-[#222630] rounded-2xl p-8 text-center">
          <Clock className="w-10 h-10 text-[#648BFF] mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-[#F4F5F7]">No Expiry Alerts Found</h3>
          <p className="text-xs text-[#9299A5] mt-1">
            Documents with expiration dates (like Passports, Driving Licenses, Certifications) will automatically appear here with 30, 15, 7, and 1-day reminders.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div
              key={alert.documentId}
              className="bg-[#171A20] border border-[#222630] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#2D3342] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[#F4F5F7]">
                    {alert.documentName}
                  </h4>
                  {getStatusBadge(alert.status, alert.daysRemaining)}
                </div>

                <div className="flex items-center gap-2 text-xs text-[#9299A5]">
                  <span>{alert.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#648BFF]" />
                    <span>Expires: {alert.expiryDate}</span>
                  </span>
                </div>

                {/* Renewal Checklist Points */}
                {alert.renewalChecklist?.length > 0 && (
                  <div className="pt-2 text-[11px] text-[#C5CAD3]">
                    <span className="text-[#9299A5] font-medium block mb-0.5">Renewal Checklist:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[#9299A5]">
                      {alert.renewalChecklist.slice(0, 2).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => onOpenDocument(alert.documentId)}
                className="px-3.5 py-2 bg-[#222630] hover:bg-[#2D3342] text-xs font-medium text-[#648BFF] rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>View Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
