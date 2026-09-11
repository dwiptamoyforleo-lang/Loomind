import React from 'react';
import {
  X,
  UserCheck,
  FolderLock,
  LogOut,
  Trash2,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { DEFAULT_USERS } from '../../data/seedData';

interface UserProfileModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onSwitchUser: (userId: string) => void;
  onClearUserData: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSwitchUser,
  onClearUserData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              User Profile & Storage Isolation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Active User Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </h4>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 truncate">{currentUser.role}</p>
              <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                {currentUser.email}
              </p>
            </div>
          </div>

          {/* Data Isolation Verification Box */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cryptographic Workspace Isolation</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
              All notebooks, citations, chats, and audio overviews are strictly partitioned under user ID: <code className="font-mono bg-emerald-100 dark:bg-emerald-900/80 px-1 rounded">{currentUser.id}</code>. No data leaks between accounts on this device.
            </p>
          </div>

          {/* Account Switcher */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Switch Researcher Account
            </p>
            <div className="space-y-1.5">
              {DEFAULT_USERS.map((user) => {
                const isSelected = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      if (!isSelected) {
                        onSwitchUser(user.id);
                        onClose();
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.role}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 hover:text-indigo-600">
                        Switch
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear user data action */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Reset workspace for this user:</span>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset this user account data to clean defaults?')) {
                  onClearUserData();
                  onClose();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
