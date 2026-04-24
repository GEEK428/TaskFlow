import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Trophy, Target, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [myStats, setMyStats] = useState({ rank: 0, onTimeCount: 0, score: 0, totalUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const [lbRes, myRes] = await Promise.all([
                    api.get('/leaderboard'),
                    api.get('/leaderboard/me')
                ]);
                setLeaderboard(lbRes.data.leaderboard);
                setMyStats(myRes.data);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const paginatedUsers = leaderboard.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const hasNext = (page + 1) * ITEMS_PER_PAGE < leaderboard.length;


    const percentile = myStats.totalUsers > 0
        ? ((myStats.rank / myStats.totalUsers) * 100).toFixed(1)
        : '0';

    const getRankColor = (rank) => {
        if (rank === 1) return '#FFD700';
        if (rank === 2) return '#C0C0C0';
        if (rank === 3) return '#CD7F32';
        return 'var(--text-dim)';
    };

    if (loading) {
        return (
            <MainLayout>
                <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                    <div className="animate-pulse" style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.8rem' }}>Syncing Elite Rankings...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="dashboard-view animate-fade" style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

                { }
                <header className="leaderboard-mobile-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.5px' }}>Performance Leaderboard</h1>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-mute)', maxWidth: '400px' }}>Global Top 50 elite rankings based on precision.</p>
                    </div>

                    <div className="rank-badge-mobile" style={{
                        padding: '10px 20px',
                        background: 'rgba(151, 166, 255, 0.05)',
                        border: '1px solid rgba(151, 166, 255, 0.2)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent)', color: '#0b0e14', display: 'grid', placeItems: 'center' }}>
                            <Trophy size={16} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.55rem', color: 'var(--text-mute)', textTransform: 'uppercase', fontWeight: '800' }}>Rank</span>
                            <h4 style={{ fontSize: '1rem', fontWeight: '900', color: 'white' }}>#{myStats.rank || '--'}</h4>
                        </div>
                    </div>
                </header>

                { }
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(151, 166, 255, 0.1)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
                            <Target size={20} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-mute)', fontWeight: '700', textTransform: 'uppercase' }}>Elite Score</span>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '2px' }}>{myStats.score || 0} <span style={{ fontSize: '0.75rem', color: 'var(--text-mute)', fontWeight: '500', marginLeft: '4px' }}>({myStats.onTimeCount} On-Time)</span></h3>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'grid', placeItems: 'center' }}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-mute)', fontWeight: '700', textTransform: 'uppercase' }}>Global Status</span>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '2px' }}>Top {percentile}%</h3>
                        </div>
                    </div>
                </div>

                { }
                <div className="mobile-scroll-container" style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '28px',
                    marginBottom: '2rem',
                    position: 'relative'
                }}>
                    <div className="mobile-scroll-content">
                        <div style={{ padding: '1.5rem 2.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '80px 1fr 140px', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <span>Rank</span>
                            <span>Productivity Master</span>
                            <span style={{ textAlign: 'right' }}>Total Score</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {paginatedUsers.map((player, index) => {
                                const globalIndex = (page * ITEMS_PER_PAGE) + index + 1;
                                const isMe = player._id === user?._id;

                                return (
                                    <div key={player._id} className="animate-fade" style={{ padding: '1.25rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'grid', gridTemplateColumns: '80px 1fr 140px', alignItems: 'center', background: isMe ? 'rgba(151, 166, 255, 0.03)' : 'transparent' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: getRankColor(globalIndex) }}>#{globalIndex}</span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-light)', display: 'grid', placeItems: 'center', fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase' }}>
                                                {player.avatar ? <img src={player.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} /> : player.name.charAt(0)}
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isMe ? 'white' : 'var(--text-main)' }}>{player.name}</span>
                                                {isMe && <span style={{ marginLeft: '10px', fontSize: '0.55rem', padding: '2px 8px', background: 'var(--accent)', color: '#0b0e14', borderRadius: '4px', fontWeight: '900' }}>YOU</span>}
                                            </div>
                                        </div>

                                        <span style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: '900', color: 'white' }}>
                                            {player.score || 0}
                                        </span>
                                    </div>
                                );
                            })}
                            {paginatedUsers.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-mute)', fontSize: '0.85rem' }}>No elite performers recorded in this bracket.</div>}
                        </div>
                    </div>

                    {}
                    <div style={{ padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-mute)', fontWeight: '600' }}>Top 50 Elite Hub • Page {page + 1} of 5</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'transparent', color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.2s', opacity: page === 0 ? 0.2 : 1 }}><ChevronLeft size={16} /></button>
                            <button onClick={() => setPage(p => Math.min(4, p + 1))} disabled={!hasNext} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'transparent', color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.2s', opacity: !hasNext ? 0.2 : 1 }}><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Leaderboard;
