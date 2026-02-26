import {
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileArchive,
} from 'lucide-react';
import { getFileIcon } from '@/context/TransferContext';

interface FileIconProps {
  mimeType: string;
  className?: string;
  /** Use 'muted' for lighter colors (e.g. branded/dark backgrounds) */
  variant?: 'default' | 'muted';
}

const COLORS_DEFAULT: Record<string, string> = {
  image: 'text-pink-500',
  video: 'text-purple-500',
  audio: 'text-green-500',
  pdf: 'text-red-500',
  doc: 'text-blue-500',
  spreadsheet: 'text-emerald-500',
  archive: 'text-yellow-500',
};

const COLORS_MUTED: Record<string, string> = {
  image: 'text-pink-400',
  video: 'text-purple-400',
  audio: 'text-green-400',
  pdf: 'text-red-400',
  doc: 'text-blue-400',
  spreadsheet: 'text-emerald-400',
  archive: 'text-yellow-400',
};

const ICON_MAP: Record<string, typeof File> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  pdf: FileText,
  doc: FileText,
  spreadsheet: FileText,
  text: FileText,
  presentation: FileText,
  archive: FileArchive,
};

export default function FileIcon({ mimeType, className, variant = 'default' }: FileIconProps) {
  const iconType = getFileIcon(mimeType);
  const iconClass = className || 'w-6 h-6';
  const colors = variant === 'muted' ? COLORS_MUTED : COLORS_DEFAULT;
  const color = colors[iconType] || 'text-gray-400';
  const IconComponent = ICON_MAP[iconType] || File;

  return <IconComponent className={`${iconClass} ${color}`} />;
}
