import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TerraPost, TerraPostCategory } from '../../types';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Share2,
  Filter,
  PlusCircle,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Lock,
  User,
  Heart,
  Globe2,
  X,
  Upload,
  Loader2,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';

export const CommunitySocialFeed: React.FC = () => {
  const mainView = useAppStore(s => s.mainView);
  const terraPosts = useAppStore(s => s.terraPosts);
  const feedCategory = useAppStore(s => s.feedCategory);
  const setFeedCategory = useAppStore(s => s.setFeedCategory);
  const feedCityFilter = useAppStore(s => s.feedCityFilter);
  const setFeedCityFilter = useAppStore(s => s.setFeedCityFilter);
  const feedAreaFilter = useAppStore(s => s.feedAreaFilter);
  const setFeedAreaFilter = useAppStore(s => s.setFeedAreaFilter);
  const currentLocation = useAppStore(s => s.currentLocation);
  const userSession = useAppStore(s => s.userSession);
  const setCognitoModalOpen = useAppStore(s => s.setCognitoModalOpen);
  const logoutCognito = useAppStore(s => s.logoutCognito);
  const fetchTerraPosts = useAppStore(s => s.fetchTerraPosts);
  const submitTerraPost = useAppStore(s => s.submitTerraPost);
  const upvotePost = useAppStore(s => s.upvotePost);
  const rsvpPost = useAppStore(s => s.rsvpPost);
  const donatePost = useAppStore(s => s.donatePost);
  const setCitizenFlaggingOpen = useAppStore(s => s.setCitizenFlaggingOpen);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostingOpen, setIsPostingOpen] = useState(false);

  // New Post Form State
  const [newPostType, setNewPostType] = useState<'complaint' | 'volunteer' | 'fundraise' | 'discuss'>('discuss');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [newTargetGoal, setNewTargetGoal] = useState<number>(500);
  const [newEventDate, setNewEventDate] = useState('Saturday, Oct 25 • 08:00 AM');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postSuccessNotice, setPostSuccessNotice] = useState(false);

  // Donation Modal State
  const [donatingPostId, setDonatingPostId] = useState<string | null>(null);
  const [customDonation, setCustomDonation] = useState(25);

  const isDelhi = feedCityFilter.toLowerCase().includes('delhi') ||
    (feedCityFilter === 'all' && currentLocation.name.toLowerCase().includes('delhi'));
  const isBengaluru = feedCityFilter.toLowerCase().includes('bengaluru') ||
    feedCityFilter.toLowerCase().includes('bangalore') ||
    (feedCityFilter === 'all' && currentLocation.name.toLowerCase().includes('bengaluru'));

  const DELHI_AREAS = ['Anand Vihar', 'Connaught Place', 'Rohini', 'Yamuna Vihar', 'Aravali Ridge', 'Dwarka'];
  const BENGALURU_AREAS = ['Bellandur', 'Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout'];

  const availableAreas = isDelhi ? DELHI_AREAS : isBengaluru ? BENGALURU_AREAS : [];

  useEffect(() => {
    fetchTerraPosts();
  }, [feedCityFilter, feedCategory, feedAreaFilter]);

  if (mainView !== 'community') return null;

  // Filter posts with city and neighborhood area support
  const filteredPosts = terraPosts.filter(p => {
    const matchesCategory = feedCategory === 'all' || p.postType === feedCategory;
    
    let matchesCity = feedCityFilter === 'all';
    if (!matchesCity) {
      const target = feedCityFilter.toLowerCase();
      const postCity = (p.cityName || '').toLowerCase();
      if (target.includes('delhi') && postCity.includes('delhi')) {
        matchesCity = true;
      } else if ((target.includes('bengaluru') || target.includes('bangalore')) && (postCity.includes('bengaluru') || postCity.includes('bangalore'))) {
        matchesCity = true;
      } else {
        matchesCity = postCity === target;
      }
    }

    let matchesArea = feedAreaFilter === 'all';
    if (!matchesArea) {
      const targetArea = feedAreaFilter.toLowerCase();
      const postArea = (p.areaName || '').toLowerCase();
      matchesArea = postArea === targetArea ||
        p.title.toLowerCase().includes(targetArea) ||
        p.content.toLowerCase().includes(targetArea);
    }

    const matchesQuery = searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.areaName && p.areaName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesCity && matchesArea && matchesQuery;
  });

  const handleOpenCreatePost = () => {
    if (!userSession.isAuthenticated) {
      setCognitoModalOpen(true, 'login');
      return;
    }
    setIsPostingOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const res = await fetch('/api/aws/s3/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type || 'image/jpeg' })
      });
      if (res.ok) {
        const { uploadUrl, publicUrl } = await res.json();
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'image/jpeg' },
          body: file
        });
        setNewImageUrl(publicUrl);
      }
      setIsUploadingPhoto(false);
    } catch {
      setIsUploadingPhoto(false);
      setNewImageUrl('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
    }
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmittingPost(true);
    try {
      await submitTerraPost({
        cityName: feedCityFilter === 'all' ? currentLocation.name : feedCityFilter,
        areaName: newAreaName || undefined,
        postType: newPostType,
        title: newTitle,
        content: newContent,
        imageUrl: newImageUrl || undefined,
        targetGoal: newPostType === 'fundraise' ? Number(newTargetGoal) : undefined,
        eventDate: newPostType === 'volunteer' ? newEventDate : undefined,
        coordinates: currentLocation.center
      });

      setNewTitle('');
      setNewContent('');
      setNewAreaName('');
      setNewImageUrl('');
      setIsSubmittingPost(false);
      setIsPostingOpen(false);
      setPostSuccessNotice(true);
      setTimeout(() => setPostSuccessNotice(false), 3000);
    } catch {
      setIsSubmittingPost(false);
    }
  };

  const handleConfirmDonation = (postId: string) => {
    donatePost(postId, customDonation);
    setDonatingPostId(null);
  };

  return (
    <div className="absolute inset-0 z-30 pt-16 bg-slate-950/98 backdrop-blur-2xl text-white overflow-hidden flex flex-col select-none">
      {/* Community Sub-Header Bar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/90 flex flex-col gap-3 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* City Filter & Scope */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-sans">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">City:</span>
              <select
                value={feedCityFilter}
                onChange={(e) => setFeedCityFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 focus:border-emerald-400 rounded-xl px-2.5 py-1 text-xs text-emerald-300 font-semibold outline-none cursor-pointer"
              >
                <option value="Delhi">📍 Delhi NCR (Hackathon)</option>
                <option value="Bengaluru">📍 Bengaluru</option>
                <option value="all">🌐 All Cities</option>
                <option value="Paris">📍 Paris</option>
                <option value="Tokyo">📍 Tokyo</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 hidden sm:inline">•</span>

            <span className="text-xs text-emerald-400/90 hidden sm:inline flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Citizen Stream
            </span>
          </div>

          {/* Search Post bar */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports, areas, drives..."
              className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-400 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

        {/* User Account / Sign In */}
        <div className="flex items-center gap-2.5">
          {userSession.isAuthenticated ? (
            <div className="flex items-center gap-2 p-1 pl-2.5 rounded-2xl bg-black/60 border border-emerald-500/30">
              <div className="text-right">
                <span className="text-xs font-semibold text-white block leading-tight">{userSession.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono block leading-tight">{userSession.role}</span>
              </div>
              <img
                src={userSession.avatarUrl}
                alt="Avatar"
                className="w-7 h-7 rounded-xl object-cover border border-white/10"
              />
              <button
                onClick={logoutCognito}
                className="text-[10px] text-slate-400 hover:text-rose-400 px-2 py-1 font-mono transition-colors"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCognitoModalOpen(true, 'login')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Neighborhood Area Filter Chips for Delhi and Bengaluru */}
        {availableAreas.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isDelhi ? 'Delhi' : 'Bengaluru'} Areas:</span>
            </span>
            <button
              onClick={() => setFeedAreaFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                feedAreaFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              All {isDelhi ? 'Delhi' : 'Bengaluru'}
            </button>
            {availableAreas.map(area => {
              const isSelected = feedAreaFilter.toLowerCase() === area.toLowerCase();
              return (
                <button
                  key={area}
                  onClick={() => setFeedAreaFilter(area)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>📍 {area}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Social Feed Layout: Sidebar Filters + Feed Column */}
      <div className="flex-1 overflow-hidden flex max-w-7xl mx-auto w-full">
        {/* Left Sidebar Category Filters */}
        <aside className="w-64 p-4 border-r border-white/10 hidden md:flex flex-col gap-1.5 flex-shrink-0 bg-black/20">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 px-2">
            Action Categories
          </span>

          {[
            { id: 'all', label: 'All Community Posts', icon: Globe2, count: terraPosts.length },
            { id: 'complaint', label: '🚨 Reports & Complaints', icon: AlertTriangle, count: terraPosts.filter(p => p.postType === 'complaint').length },
            { id: 'volunteer', label: '🤝 Volunteer Drives', icon: Calendar, count: terraPosts.filter(p => p.postType === 'volunteer').length },
            { id: 'fundraise', label: '💰 Fundraise Projects', icon: DollarSign, count: terraPosts.filter(p => p.postType === 'fundraise').length },
            { id: 'discuss', label: '💬 Citizen Discussions', icon: MessageSquare, count: terraPosts.filter(p => p.postType === 'discuss').length }
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = feedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFeedCategory(cat.id as TerraPostCategory)}
                className={`w-full px-3 py-2.5 rounded-2xl text-left text-xs font-medium flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{cat.label}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-slate-400">
                  {cat.count}
                </span>
              </button>
            );
          })}

          {/* Environmental Mission Callout */}
          <div className="mt-auto p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 text-[11px] text-slate-400 space-y-1.5">
            <span className="text-white font-semibold flex items-center gap-1 font-tech uppercase">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Citizen Ground Truth
            </span>
            <p className="leading-relaxed">
              Every verified complaint is georeferenced and shared with relevant municipal agencies and neighborhood response teams.
            </p>
          </div>
        </aside>

        {/* Central Feed Stream */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Create Post Prompt Bar */}
          <div className="p-4 rounded-3xl bg-black/60 border border-white/10 shadow-xl flex items-center gap-3">
            <img
              src={userSession.avatarUrl}
              alt="User Avatar"
              className="w-10 h-10 rounded-2xl object-cover border border-white/10 flex-shrink-0"
            />
            <button
              onClick={handleOpenCreatePost}
              className="flex-1 bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-slate-400 hover:text-white text-left transition-colors font-sans flex items-center justify-between"
            >
              <span>{userSession.isAuthenticated ? `What's happening in ${feedCityFilter === 'all' ? currentLocation.name : feedCityFilter}, ${userSession.name}?` : 'Sign in to share an update, organize a drive, or report a hazard...'}</span>
              <PlusCircle className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {postSuccessNotice && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Post published successfully to the civic community feed!</span>
            </div>
          )}

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                <Filter className="w-5 h-5" />
              </div>
              <p>No community posts match the selected filter.</p>
              <button
                onClick={() => { setFeedCategory('all'); setFeedCityFilter('all'); setFeedAreaFilter('all'); }}
                className="text-xs text-emerald-400 hover:underline font-mono"
              >
                Reset filters to show all posts
              </button>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div
                key={post.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-3.5"
              >
                {/* Post Top Metadata */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorName}`}
                      alt={post.authorName}
                      className="w-9 h-9 rounded-2xl object-cover border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{post.authorName}</span>
                        {post.authorRole && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {post.authorRole}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-300">{post.cityName}</span>
                        {post.areaName && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                              📍 {post.areaName}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    post.postType === 'complaint'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : post.postType === 'volunteer'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : post.postType === 'fundraise'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    {post.postType === 'complaint' && '🚨 Complaint / Report'}
                    {post.postType === 'volunteer' && '🤝 Volunteer Drive'}
                    {post.postType === 'fundraise' && '💰 Micro-Fundraiser'}
                    {post.postType === 'discuss' && '💬 Citizen Discussion'}
                  </span>
                </div>

                {/* Post Title & Content */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Photo Evidence if uploaded */}
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-white/10 max-h-72 bg-black">
                    <img
                      src={post.imageUrl}
                      alt="Pollution evidence"
                      className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                )}

                {/* VOLUNTEER CARD SPECIFICS */}
                {post.postType === 'volunteer' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">Scheduled Event</span>
                        <span className="text-xs font-bold text-white">{post.eventDate || 'Upcoming Weekend Drive'}</span>
                        <span className="text-[10px] font-mono text-emerald-300 block">
                          👥 {post.rsvpCount || 0} Citizens Confirmed
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => rsvpPost(post.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                        post.hasUserRsvped
                          ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {post.hasUserRsvped ? '✓ RSVP\'d' : 'RSVP Now'}
                    </button>
                  </div>
                )}

                {/* FUNDRAISE CARD SPECIFICS */}
                {post.postType === 'fundraise' && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white font-tech uppercase">Crowdfund Target</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        ${post.currentAmount || 0} / ${post.targetGoal || 500}
                      </span>
                    </div>

                    {/* Tailwind Progress Bar */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round(((post.currentAmount || 0) / (post.targetGoal || 500)) * 100))}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-slate-400">
                        {Math.round(((post.currentAmount || 0) / (post.targetGoal || 500)) * 100)}% Funded • Transparent Community HEPA Fund
                      </span>

                      <button
                        onClick={() => setDonatingPostId(post.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
                      >
                        Donate Funds
                      </button>
                    </div>
                  </div>
                )}

                {/* COMPLAINT CARD SPECIFICS (TAGGED AUTHORITIES) */}
                {post.postType === 'complaint' && post.taggedAuthorities && post.taggedAuthorities.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-slate-400">
                    <span className="text-rose-400 font-semibold">Notified Authorities:</span>
                    {post.taggedAuthorities.map((auth, idx) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
                        {auth}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Action Bar: Upvote, Comments, Share */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => upvotePost(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.hasUserUpvoted ? 'text-cyan-400 font-bold' : 'hover:text-white'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${post.hasUserUpvoted ? 'fill-current' : ''}`} />
                      <span>{post.upvotes || 0}</span>
                    </button>

                    <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentsCount || 0} comments</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                    className="flex items-center gap-1 hover:text-white transition-colors text-[11px]"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Flag</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      {/* CREATE NEW POST MODAL */}
      {isPostingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
          <div className="glass-panel-active rounded-3xl p-6 w-full max-w-lg border border-emerald-500/40 shadow-2xl text-left bg-slate-950/95 text-white max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-tech uppercase tracking-wide">
                    CREATE COMMUNITY POST
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Publishing as {userSession.name} ({userSession.role})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsPostingOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {/* Category selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-tech uppercase">
                  Select Post Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'discuss', label: '💬 Discuss' },
                    { id: 'complaint', label: '🚨 Report' },
                    { id: 'volunteer', label: '🤝 Volunteer' },
                    { id: 'fundraise', label: '💰 Fundraise' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewPostType(cat.id as any)}
                      className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                        newPostType === cat.id
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow'
                          : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Clear headline..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Neighborhood / Area Dropdown */}
              {availableAreas.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Neighborhood / Area
                  </label>
                  <select
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-emerald-300 outline-none cursor-pointer"
                  >
                    <option value="">Select Neighborhood (Optional)</option>
                    {availableAreas.map(area => (
                      <option key={area} value={area}>📍 {area}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Specific Category Inputs */}
              {newPostType === 'fundraise' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Funding Target Goal ($ USD)
                  </label>
                  <input
                    type="number"
                    min={50}
                    step={25}
                    value={newTargetGoal}
                    onChange={(e) => setNewTargetGoal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono outline-none"
                  />
                </div>
              )}

              {newPostType === 'volunteer' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Event Date & Time
                  </label>
                  <input
                    type="text"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    placeholder="e.g. Saturday, Nov 1 • 08:30 AM"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono outline-none"
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share details, neighborhood location, or citizen observations..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none font-sans"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  Attach Photo Evidence
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-300 hover:file:bg-slate-700"
                  />
                  {isUploadingPhoto && <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />}
                </div>
                {newImageUrl && (
                  <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-emerald-400">
                    <img src={newImageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPostingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all"
                >
                  {isSubmittingPost ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <span>Publish to Feed</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DONATE MODAL */}
      {donatingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-150 select-none">
          <div className="glass-panel-active rounded-3xl p-6 w-full max-w-sm border border-amber-500/40 shadow-2xl text-left bg-slate-950/95 text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold font-tech uppercase text-white">Direct HEPA Micro-Donation</h4>
              </div>
              <button onClick={() => setDonatingPostId(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              100% of community contributions go directly to procurement of medical-grade air filtration and sensor equipment.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[15, 25, 50].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCustomDonation(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    customDonation === amt
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-black/40 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleConfirmDonation(donatingPostId)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 transition-all"
            >
              Confirm ${customDonation} Contribution
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
