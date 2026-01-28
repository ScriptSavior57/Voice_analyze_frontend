import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { logout, fetchCurrentUser } from './store/slices/authSlice';
import TrainingStudio from './views/TrainingStudio';
import AdminMode from './views/AdminMode';
import QariDashboard from './views/QariDashboard';
import StudentProgressView from './views/StudentProgress';
import Login from './components/Login';
import Register from './components/Register';
import QariSelector from './components/QariSelector';
import { Mic2, LayoutDashboard, Users, BookOpen, Settings, LogOut, BarChart3, User, Monitor, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const [showRegister, setShowRegister] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false); // Control when to show login/register
  const [activeTab, setActiveTab] = useState<'training' | 'dashboard' | 'progress' | 'admin' | 'user-management' | 'platform-monitoring'>('training');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Try to fetch current user if token exists
    if (!isAuthenticated && localStorage.getItem('tarannum_auth_token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  // Close auth modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false);
      setShowRegister(false);
    }
  }, [isAuthenticated, showAuthModal]);

  const handleLogout = () => {
    dispatch(logout());
    setActiveTab('training');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userRole = user?.role || 'public';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Mic2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Tarannum</h1>
              <p className="text-xs text-slate-400">
                {isAuthenticated ? "AI Trainer System" : "Demo Mode - Public Access"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('training')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'training' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Mic2 size={20} />
            <span className="font-medium">
              {isAuthenticated ? "Training Studio" : "Training (Demo)"}
            </span>
          </button>

          {/* Student-specific tabs */}
          {userRole === 'student' && (
            <>
              <button
                onClick={() => setActiveTab('progress')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'progress' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <BarChart3 size={20} />
                <span className="font-medium">My Progress</span>
              </button>
            </>
          )}

          {/* Qari-specific tabs */}
          {userRole === 'qari' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">My Dashboard</span>
            </button>
          )}

          {/* Admin tabs */}
          {userRole === 'admin' && (
            <>
              <div className="pt-8 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin
              </div>
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <BookOpen size={20} />
                <span className="font-medium">Preset Manager</span>
              </button>
              <button
                onClick={() => setActiveTab('user-management')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'user-management' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Users size={20} />
                <span className="font-medium">User Management</span>
              </button>
              <button
                onClick={() => setActiveTab('platform-monitoring')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'platform-monitoring' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Monitor size={20} />
                <span className="font-medium">Platform Monitoring</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          {isAuthenticated ? (
            <>
              <div className="mb-3 px-4 py-2 text-sm">
                <div className="text-slate-300 font-medium">{user?.full_name || user?.email}</div>
                <div className="text-slate-500 text-xs capitalize">{userRole}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 px-4 py-2 text-sm">
              <div className="text-slate-300 font-medium">Public User</div>
              <div className="text-slate-500 text-xs">
                You are in demo mode.{" "}
                <button
                  className="text-emerald-400 hover:text-emerald-300 underline"
                  onClick={() => {
                    setShowRegister(false);
                    setShowAuthModal(true);
                  }}
                >
                  Login
                </button>{" "}
                or{" "}
                <button
                  className="text-emerald-400 hover:text-emerald-300 underline"
                  onClick={() => {
                    setShowRegister(true);
                    setShowAuthModal(true);
                  }}
                >
                  Register
                </button>{" "}
                for full features.
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Mic2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Tarannum</h1>
              <p className="text-xs text-slate-400">
                {isAuthenticated ? "AI Trainer System" : "Demo Mode"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => {
              setActiveTab('training');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'training' 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Mic2 size={20} />
            <span className="font-medium">
              {isAuthenticated ? "Training Studio" : "Training (Demo)"}
            </span>
          </button>

          {userRole === 'student' && (
            <button
              onClick={() => {
                setActiveTab('progress');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'progress' 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">My Progress</span>
            </button>
          )}

          {userRole === 'qari' && (
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">My Dashboard</span>
            </button>
          )}

          {userRole === 'admin' && (
            <>
              <div className="pt-8 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin
              </div>
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'admin' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen size={20} />
                <span className="font-medium">Preset Manager</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('user-management');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'user-management' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users size={20} />
                <span className="font-medium">User Management</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('platform-monitoring');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'platform-monitoring' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Monitor size={20} />
                <span className="font-medium">Platform Monitoring</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          {isAuthenticated ? (
            <>
              <div className="mb-3 px-4 py-2 text-sm">
                <div className="text-slate-300 font-medium">{user?.full_name || user?.email}</div>
                <div className="text-slate-500 text-xs capitalize">{userRole}</div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 px-4 py-2 text-sm">
              <div className="text-slate-300 font-medium">Public User</div>
              <div className="text-slate-500 text-xs">
                <button
                  className="text-emerald-400 hover:text-emerald-300 underline"
                  onClick={() => {
                    setShowRegister(false);
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </button>
                {" or "}
                <button
                  className="text-emerald-400 hover:text-emerald-300 underline"
                  onClick={() => {
                    setShowRegister(true);
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 flex-1 md:flex-none">
                 <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                    <Mic2 className="text-white" size={16} />
                </div>
                <span className="font-bold text-slate-800 text-lg">Tarannum AI</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {isAuthenticated && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  <User size={14} />
                  <span className="truncate max-w-[120px]">{user?.full_name || user?.email}</span>
                </div>
              )}
              {!isAuthenticated && (
                <>
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    Demo Mode
                  </span>
                  <button
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
                    onClick={() => {
                      setShowRegister(false);
                      setShowAuthModal(true);
                    }}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
        </header>

        <div className="min-h-[calc(100vh-64px)]">
          {/* Show login/register when user clicks Login/Register - takes over main content */}
          {!isAuthenticated && showAuthModal ? (
            <>
              {showRegister ? (
                <Register
                  onSwitchToLogin={() => setShowRegister(false)}
                  onSuccess={() => {
                    setShowRegister(false);
                    setShowAuthModal(false);
                  }}
                  onClose={() => {
                    setShowAuthModal(false);
                    setShowRegister(false);
                    setActiveTab('training');
                  }}
                />
              ) : (
                <Login
                  onSwitchToRegister={() => setShowRegister(true)}
                  onSuccess={() => {
                    setShowRegister(false);
                    setShowAuthModal(false);
                  }}
                  onClose={() => {
                    setShowAuthModal(false);
                    setShowRegister(false);
                    setActiveTab('training');
                  }}
                />
              )}
            </>
          ) : (
            <>
              {/* Training is always available (public demo or authenticated) */}
              {activeTab === 'training' && !showAuthModal && (
                <TrainingStudio />
              )}

              {/* Authenticated-only views */}
              {activeTab === 'progress' && isAuthenticated && userRole === 'student' && (
                <StudentProgressView />
              )}
              {activeTab === 'dashboard' && isAuthenticated && userRole === 'qari' && (
                <QariDashboard />
              )}
              {activeTab === 'admin' && isAuthenticated && userRole === 'admin' && (
                <AdminMode view="presets" />
              )}
              {activeTab === 'user-management' && isAuthenticated && userRole === 'admin' && (
                <AdminMode view="users" />
              )}
              {activeTab === 'platform-monitoring' && isAuthenticated && userRole === 'admin' && (
                <AdminMode view="monitoring" />
              )}

              {/* Fallback message when trying to access restricted tabs in public mode */}
              {activeTab !== 'training' && !isAuthenticated && !showAuthModal && (
                <div className="p-8 text-center text-slate-500">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Restricted Area</h2>
                  <p className="mb-4">
                    This section is only available for registered users.
                  </p>
                  <div className="space-x-3">
                    <button
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                      onClick={() => {
                        setShowRegister(false);
                        setShowAuthModal(true);
                      }}
                    >
                      Login
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900"
                      onClick={() => {
                        setShowRegister(true);
                        setShowAuthModal(true);
                      }}
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;