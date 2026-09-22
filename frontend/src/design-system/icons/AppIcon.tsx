import React from 'react';

export type AppIconName =
  | 'home'
  | 'shopping'
  | 'cart'
  | 'lists'
  | 'list'
  | 'analytics'
  | 'profile'
  | 'user'
  | 'budget'
  | 'wallet'
  | 'history'
  | 'favorites'
  | 'family'
  | 'recurring'
  | 'repeat'
  | 'reminder'
  | 'notification'
  | 'bell'
  | 'search'
  | 'settings'
  | 'gear'
  | 'ai'
  | 'sparkles'
  | 'plus'
  | 'minus'
  | 'check'
  | 'close'
  | 'edit'
  | 'delete'
  | 'trash'
  | 'back'
  | 'forward'
  | 'chevron'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'filter'
  | 'sort'
  | 'calendar'
  | 'clock'
  | 'chart'
  | 'store'
  | 'sync'
  | 'cloud'
  | 'more'
  | 'info'
  | 'warning'
  | 'success'
  | 'moon'
  | 'sun'
  | 'language'
  | 'logout'
  | 'share';

export interface AppIconProps extends React.SVGProps<SVGSVGElement> {
  name: AppIconName;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  className = '',
  strokeWidth = 1.75,
  ...props
}) => {
  const renderIcon = () => {
    switch (name) {
      case 'home':
        return (
          <>
            <path d="M3 10.5L12 3l9 7.5v9.75a1.5 1.5 0 0 1-1.5 1.5H15v-6a3 3 0 0 0-6 0v6H4.5A1.5 1.5 0 0 1 3 20.25V10.5z" />
          </>
        );

      case 'shopping':
      case 'cart':
        return (
          <>
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.5 3.5h3l2.4 12a1.5 1.5 0 0 0 1.5 1.2h9.4a1.5 1.5 0 0 0 1.5-1.1L22 7.5H6.2" />
          </>
        );

      case 'lists':
      case 'list':
        return (
          <>
            <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
          </>
        );

      case 'analytics':
      case 'chart':
        return (
          <>
            <path d="M3 3v18h18" />
            <path d="M7 16l4-6 4 4 6-9" />
          </>
        );

      case 'profile':
      case 'user':
        return (
          <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </>
        );

      case 'budget':
      case 'wallet':
        return (
          <>
            <rect x="2" y="6" width="20" height="14" rx="3" />
            <path d="M2 10h20M16 14h2" />
          </>
        );

      case 'history':
      case 'clock':
        return (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6v6l4 2" />
          </>
        );

      case 'favorites':
        return (
          <>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </>
        );

      case 'family':
        return (
          <>
            <path d="M16 21v-2a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v2" />
            <circle cx="12" cy="7" r="3" />
            <path d="M22 21v-1.5a2.5 2.5 0 0 0-2-2.45M2 21v-1.5a2.5 2.5 0 0 1 2-2.45" />
            <circle cx="19" cy="9" r="2" />
            <circle cx="5" cy="9" r="2" />
          </>
        );

      case 'recurring':
      case 'repeat':
      case 'sync':
        return (
          <>
            <path d="M21 12a9 9 0 0 1-15.5 6.4L3 16" />
            <path d="M3 21v-5h5" />
            <path d="M3 12a9 9 0 0 1 15.5-6.4L21 8" />
            <path d="M21 3v5h-5" />
          </>
        );

      case 'reminder':
      case 'notification':
      case 'bell':
        return (
          <>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </>
        );

      case 'search':
        return (
          <>
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </>
        );

      case 'settings':
      case 'gear':
        return (
          <>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </>
        );

      case 'ai':
      case 'sparkles':
        return (
          <>
            <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z" />
            <path d="M19 16l1.2 2.8L23 20l-2.8 1.2L19 24l-1.2-2.8L15 20l2.8-1.2z" />
          </>
        );

      case 'plus':
        return (
          <>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </>
        );

      case 'minus':
        return (
          <>
            <line x1="5" y1="12" x2="19" y2="12" />
          </>
        );

      case 'check':
        return (
          <>
            <polyline points="20 6 9 17 4 12" />
          </>
        );

      case 'close':
        return (
          <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </>
        );

      case 'edit':
        return (
          <>
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </>
        );

      case 'delete':
      case 'trash':
        return (
          <>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </>
        );

      case 'back':
      case 'chevron-left':
        return (
          <>
            <polyline points="15 18 9 12 15 6" />
          </>
        );

      case 'forward':
      case 'chevron-right':
      case 'chevron':
        return (
          <>
            <polyline points="9 18 15 12 9 6" />
          </>
        );

      case 'chevron-down':
        return (
          <>
            <polyline points="6 9 12 15 18 9" />
          </>
        );

      case 'chevron-up':
        return (
          <>
            <polyline points="18 15 12 9 6 15" />
          </>
        );

      case 'filter':
        return (
          <>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </>
        );

      case 'sort':
        return (
          <>
            <path d="M11 5h10M11 9h7M11 13h4M3 17l4 4 4-4M7 3v18" />
          </>
        );

      case 'calendar':
        return (
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </>
        );

      case 'store':
        return (
          <>
            <path d="M3 9l2-5h14l2 5" />
            <path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
            <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
            <line x1="10" y1="14" x2="14" y2="14" />
          </>
        );

      case 'cloud':
        return (
          <>
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </>
        );

      case 'more':
        return (
          <>
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </>
        );

      case 'info':
        return (
          <>
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="8.01" />
            <line x1="12" y1="12" x2="12" y2="16" />
          </>
        );

      case 'warning':
        return (
          <>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </>
        );

      case 'success':
        return (
          <>
            <circle cx="12" cy="12" r="9" />
            <polyline points="9 12 11 14 15 10" />
          </>
        );

      case 'sun':
        return (
          <>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </>
        );

      case 'moon':
        return (
          <>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </>
        );

      case 'language':
        return (
          <>
            <circle cx="12" cy="12" r="9" />
            <line x1="3.6" y1="9" x2="20.4" y2="9" />
            <line x1="3.6" y1="15" x2="20.4" y2="15" />
            <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
          </>
        );

      case 'logout':
        return (
          <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </>
        );

      case 'share':
        return (
          <>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </>
        );

      default:
        return (
          <>
            <circle cx="12" cy="12" r="9" />
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {renderIcon()}
    </svg>
  );
};
