"use client";
import { useState, useEffect } from "react";
import { Download, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { animeApi } from "@/lib/api";

export default function BatchDownload({ animeId, animeTitle }) {
  const [batchInfo, setBatchInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState('1080p');
  const [expandedPack, setExpandedPack] = useState(null);
  const [downloadData, setDownloadData] = useState({});

  useEffect(() => {
    async function fetchBatchInfo() {
      try {
        setLoading(true);
        const data = await animeApi.getBatchDownloadInfo(animeId);
        setBatchInfo(data);
        if (data.resolutions && data.resolutions.length > 0) {
          setSelectedResolution(data.resolutions[0]);
        }
      } catch (e) {
        console.error('[BatchDownload] Error:', e);
      } finally {
        setLoading(false);
      }
    }
    
    if (animeId) {
      fetchBatchInfo();
    }
  }, [animeId]);

  const handlePackExpand = async (pack) => {
    if (downloadData[pack.packNumber]) {
      // Already loaded, just toggle
      setExpandedPack(expandedPack === pack.packNumber ? null : pack.packNumber);
      return;
    }

    try {
      setExpandedPack(pack.packNumber);
      const data = await animeApi.getBatchDownload(
        animeId,
        selectedResolution,
        pack.startEpisode,
        pack.endEpisode
      );
      setDownloadData(prev => ({
        ...prev,
        [pack.packNumber]: data.downloads || []
      }));
    } catch (e) {
      console.error('[BatchDownload] Error loading pack:', e);
      alert('Gagal memuat data download pack');
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-black/5 dark:border-white/5 rounded-3xl p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading batch download info...</span>
        </div>
      </div>
    );
  }

  if (!batchInfo || !batchInfo.batches || batchInfo.batches.length === 0) {
    // Tidak tampilkan jika tidak ada batch info atau episode kurang dari 25
    return null;
  }

  return (
    <div className="bg-card border border-black/5 dark:border-white/5 rounded-3xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase italic mb-2">
            <div className="w-1.5 h-8 bg-accent rounded-full" />
            Batch Download
          </h3>
          <p className="text-sm font-bold text-gray-400">
            Total {batchInfo.totalEpisodes} episode dalam {batchInfo.totalPacks} pack
          </p>
        </div>
      </div>

      {/* Resolution Selector */}
      {batchInfo.resolutions && batchInfo.resolutions.length > 1 && (
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
            Pilih Resolusi
          </label>
          <div className="flex flex-wrap gap-2">
            {batchInfo.resolutions.map((res) => (
              <button
                key={res}
                onClick={() => {
                  setSelectedResolution(res);
                  setDownloadData({}); // Clear cached downloads when resolution changes
                  setExpandedPack(null);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedResolution === res
                    ? 'bg-accent border-transparent text-white shadow-hd'
                    : 'bg-transparent border-black/10 dark:border-white/10 text-gray-400 hover:border-accent'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pack List */}
      <div className="space-y-3">
        {batchInfo.batches.map((pack) => {
          const isExpanded = expandedPack === pack.packNumber;
          const downloads = downloadData[pack.packNumber] || [];

          return (
            <div
              key={pack.packNumber}
              className="border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden transition-all hover:border-accent/50"
            >
              <button
                onClick={() => handlePackExpand(pack)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <div className="text-left">
                  <p className="text-sm font-black uppercase tracking-widest mb-1">{pack.label}</p>
                  <p className="text-xs font-bold text-gray-400">
                    {pack.episodeCount} episode • {selectedResolution}
                  </p>
                </div>
                <Download className={`w-5 h-5 text-accent transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="border-t border-black/5 dark:border-white/5 p-6 bg-black/5 dark:bg-white/5">
                  {downloads.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {downloads.map((download, idx) => (
                        <a
                          key={idx}
                          href={download.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-card border border-black/5 dark:border-white/5 rounded-xl hover:border-accent transition-all group"
                        >
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest">
                              Episode {download.episodeNumber}
                            </p>
                            {download.fileSize && (
                              <p className="text-[10px] font-bold text-gray-400 mt-1">
                                {download.fileSize}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

