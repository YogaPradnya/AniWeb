"use client";
import { useState, useEffect } from "react";
import { animeApi } from "@/lib/api";
import Link from "next/link";
import { Download, Loader2, ExternalLink, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";

export default function BatchDownloadPage({ params }) {
  const id = params.id;
  const [anime, setAnime] = useState(null);
  const [batchInfo, setBatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResolution, setSelectedResolution] = useState('1080p');
  const [expandedPacks, setExpandedPacks] = useState({});
  const [downloadData, setDownloadData] = useState({});
  const [loadingPacks, setLoadingPacks] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [animeData, batchData] = await Promise.all([
          animeApi.getDetail(id).catch(() => null),
          animeApi.getBatchDownloadInfo(id).catch(() => null)
        ]);
        setAnime(animeData);
        setBatchInfo(batchData);
        if (batchData?.resolutions && batchData.resolutions.length > 0) {
          setSelectedResolution(batchData.resolutions[0]);
        }
      } catch (e) {
        console.error('[BatchDownloadPage] Error:', e);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handlePackExpand = async (pack) => {
    const packKey = pack.packNumber;
    const isExpanded = expandedPacks[packKey];

    if (isExpanded) {
      // Collapse
      setExpandedPacks(prev => {
        const newState = { ...prev };
        delete newState[packKey];
        return newState;
      });
      return;
    }

    // Expand and load data
    setExpandedPacks(prev => ({ ...prev, [packKey]: true }));

    if (downloadData[packKey]) {
      // Already loaded
      return;
    }

    // Set loading state
    setLoadingPacks(prev => ({ ...prev, [packKey]: true }));

    try {
      // Add timeout untuk mencegah loading terlalu lama
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout setelah 60 detik')), 60000)
      );

      const dataPromise = animeApi.getBatchDownload(
        id,
        selectedResolution,
        pack.startEpisode,
        pack.endEpisode
      );

      const data = await Promise.race([dataPromise, timeoutPromise]);
      
      setDownloadData(prev => ({
        ...prev,
        [packKey]: data.downloads || []
      }));
    } catch (e) {
      console.error('[BatchDownloadPage] Error loading pack:', e);
      alert(e.message || 'Gagal memuat data download pack. Silakan coba lagi.');
      setExpandedPacks(prev => {
        const newState = { ...prev };
        delete newState[packKey];
        return newState;
      });
    } finally {
      setLoadingPacks(prev => {
        const newState = { ...prev };
        delete newState[packKey];
        return newState;
      });
    }
  };

  const handleResolutionChange = (res) => {
    setSelectedResolution(res);
    setDownloadData({}); // Clear cached downloads
    setExpandedPacks({}); // Collapse all packs
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-32">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
          <span className="text-lg font-black text-gray-400 uppercase tracking-widest">Loading batch download info...</span>
        </div>
      </div>
    );
  }

  if (!batchInfo || !batchInfo.batches || batchInfo.batches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-32">
        <Link href={`/anime/${id}`} className="inline-flex items-center gap-2 text-sm font-black text-accent hover:text-white uppercase tracking-widest mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Anime Detail
        </Link>
        <div className="text-center py-20 border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-lg mb-2">Batch Download Tidak Tersedia</p>
          <p className="text-sm text-gray-500">Anime ini tidak memiliki cukup episode untuk batch download (minimal 25 episode)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <Link href={`/anime/${id}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-accent hover:text-white uppercase tracking-widest mb-4 sm:mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to </span>{anime?.title || 'Anime Detail'}
        </Link>
        
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8">
          {anime?.poster && (
            <img
              src={anime.poster}
              alt={anime.title}
              className="w-24 h-36 sm:w-32 sm:h-48 object-cover rounded-xl sm:rounded-2xl shadow-hd mx-auto sm:mx-0"
            />
          )}
          <div className="flex-grow w-full">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter mb-2 italic break-words">
              {anime?.title || 'Batch Download'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 font-bold mb-4 sm:mb-6">
              Total {batchInfo.totalEpisodes} episode dalam {batchInfo.totalPacks} pack
            </p>
            
            {/* Resolution Selector */}
            {batchInfo.resolutions && batchInfo.resolutions.length > 1 && (
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 block">
                  Pilih Resolusi
                </label>
                <div className="flex flex-wrap gap-2">
                  {batchInfo.resolutions.map((res) => (
                    <button
                      key={res}
                      onClick={() => handleResolutionChange(res)}
                      className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all border ${
                        selectedResolution === res
                          ? 'bg-accent-gradient border-transparent text-white shadow-hd'
                          : 'bg-card border-black/10 dark:border-white/10 text-gray-400 hover:border-accent'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pack List */}
      <div className="space-y-4">
        {batchInfo.batches.map((pack) => {
          const packKey = pack.packNumber;
          const isExpanded = expandedPacks[packKey];
          const downloads = downloadData[packKey] || [];

          return (
            <div
              key={packKey}
              className="bg-card border-2 border-black/5 dark:border-white/5 rounded-3xl overflow-hidden transition-all hover:border-accent/50"
            >
              <button
                onClick={() => handlePackExpand(pack)}
                className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <div className="text-left flex-1 min-w-0 pr-4">
                  <p className="text-sm sm:text-base lg:text-lg font-black uppercase tracking-widest mb-1 truncate">{pack.label}</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-400">
                    {pack.episodeCount} episode • {selectedResolution}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {loadingPacks[packKey] && (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-accent" />
                  )}
                  {isExpanded && downloads.length > 0 && !loadingPacks[packKey] && (
                    <span className="hidden sm:inline text-xs font-black text-accent uppercase tracking-widest">
                      {downloads.length} links
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t-2 border-black/5 dark:border-white/5 p-4 sm:p-6 lg:p-8 bg-black/5 dark:bg-white/5">
                  {loadingPacks[packKey] ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-accent" />
                      <div className="text-center space-y-2 px-4">
                        <p className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-widest">
                          Memuat {pack.episodeCount} link download...
                        </p>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500">
                          Proses ini mungkin memakan waktu beberapa saat
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : downloads.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto custom-scrollbar">
                      {downloads.map((download, idx) => (
                        <a
                          key={idx}
                          href={download.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 sm:p-4 bg-card border border-black/5 dark:border-white/5 rounded-xl sm:rounded-2xl hover:border-accent transition-all group"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg sm:rounded-xl flex-shrink-0">
                              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-black uppercase tracking-widest truncate">
                                Episode {download.episodeNumber}
                              </p>
                              {download.fileSize && (
                                <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-1">
                                  {download.fileSize}
                                </p>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-accent transition-colors flex-shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-3">
                      <p className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-widest">
                        Tidak ada data download
                      </p>
                      <button
                        onClick={() => handlePackExpand(pack)}
                        className="text-xs font-bold text-accent hover:text-white uppercase tracking-widest px-4 py-2 rounded-lg sm:rounded-xl border border-accent/30 hover:bg-accent transition-all"
                      >
                        Coba Lagi
                      </button>
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

