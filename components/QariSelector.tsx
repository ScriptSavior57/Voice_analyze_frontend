/**
 * Component for students to select and assign to a Qari.
 */
import React, { useEffect, useState } from "react";
import { getMyQari, assignToQari, getAvailableQaris } from "../services/platformService";
import { User, Check, AlertCircle } from "lucide-react";

interface QariSelectorProps {
  onQariSelected?: () => void;
}

const QariSelector: React.FC<QariSelectorProps> = ({ onQariSelected }) => {
  const [qaris, setQaris] = useState<Array<{
    id: string;
    email: string;
    full_name?: string;
    is_approved: boolean;
    is_active: boolean;
  }>>([]);
  const [currentQari, setCurrentQari] = useState<{
    qari_id: string;
    qari_email: string;
    qari_name?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qariList, myQari] = await Promise.all([
        getAvailableQaris(),
        getMyQari(),
      ]);
      setQaris(qariList.qaris.filter((q) => q.is_approved && q.is_active));
      if (myQari.qari) {
        setCurrentQari(myQari.qari);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Qaris");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (qariId: string) => {
    try {
      setAssigning(true);
      setError(null);
      await assignToQari(qariId);
      await loadData();
      onQariSelected?.();
    } catch (err: any) {
      setError(err.message || "Failed to assign to Qari");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (currentQari) {
    return (
      <div className="p-6 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Your Qari</h3>
            <p className="text-sm text-gray-600">
              {currentQari.qari_name || currentQari.qari_email}
            </p>
          </div>
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <button
          onClick={loadData}
          className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Change Qari
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Select Your Qari / Teacher
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Choose a Qari to follow and practice with their recitation style.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {qaris.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No approved Qaris available at the moment.</p>
          <p className="text-sm mt-2">Please check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {qaris.map((qari) => (
            <div
              key={qari.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {qari.full_name || "Qari"}
                    </div>
                    <div className="text-sm text-gray-600">{qari.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAssign(qari.id)}
                  disabled={assigning}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {assigning ? "Assigning..." : "Select"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QariSelector;
