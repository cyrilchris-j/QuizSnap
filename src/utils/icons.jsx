// ── Centralized Icon Mapping ──────────────────────────────────────────────────
// Maps icon keys used in data (BADGES, LEVELS, MODULES, etc.) to Lucide icons.
// This replaces all emojis with professional SVG icons.

import {
  Sprout, Leaf, TreePine, Globe, Flame, Zap, Recycle, Droplets, Sun, Bug,
  Waves, Thermometer, Trophy, CalendarDays, Star, Award, Brain, BookOpen,
  ShoppingBag, ShowerHead, Lightbulb, Salad, Trash2, Footprints, Printer,
  TreeDeciduous, Plug, Wind, Bird, Monitor, Flower2, Fuel, Smartphone,
  Backpack, Droplet, GraduationCap, Apple, Handshake, CloudSun, Fish, Battery,
  Ship, Wheat, Target, CheckCircle, XCircle, Clock, AlertTriangle, Sparkles,
  Lock, Unlock, ClipboardList, Newspaper, Medal, Crown, BookOpenCheck, Package,
  Rocket, PartyPopper, MapPin, CircleDot, Check, Timer, TrendingUp,
  FileText, Edit, User, Heart, Info, ChevronRight, BarChart3, CircleCheck,
  Compass, Gem, Shield, BrainCircuit, FlaskConical, Milestone
} from 'lucide-react';

// ── Icon Component ────────────────────────────────────────────────────────────
// Renders a Lucide icon by key name. Used wherever data-driven icons are needed.
const ICON_MAP = {
  // Levels
  'sprout': Sprout,
  'leaf': Leaf,
  'tree-pine': TreePine,
  'tree': TreeDeciduous,
  'globe': Globe,

  // Badges
  'flame': Flame,
  'zap': Zap,
  'recycle': Recycle,
  'droplets': Droplets,
  'droplet': Droplet,
  'sun': Sun,
  'butterfly': Bug,
  'waves': Waves,
  'thermometer': Thermometer,
  'trophy': Trophy,
  'calendar': CalendarDays,
  'star': Star,
  'award': Award,
  'medal': Medal,
  'crown': Crown,

  // Modules
  'brain': Brain,
  'book-open': BookOpen,

  // Daily Challenges
  'shopping-bag': ShoppingBag,
  'shower': ShowerHead,
  'lightbulb': Lightbulb,
  'salad': Salad,
  'trash': Trash2,
  'footprints': Footprints,
  'printer': Printer,
  'plug': Plug,
  'wind': Wind,
  'bird': Bird,
  'monitor': Monitor,
  'flower': Flower2,
  'smartphone': Smartphone,
  'backpack': Backpack,
  'apple': Apple,
  'handshake': Handshake,
  'cloud-sun': CloudSun,
  'fish': Fish,
  'battery': Battery,
  'ship': Ship,
  'wheat': Wheat,

  // Quiz & UI
  'target': Target,
  'check-circle': CheckCircle,
  'circle-check': CircleCheck,
  'x-circle': XCircle,
  'clock': Clock,
  'alert-triangle': AlertTriangle,
  'sparkles': Sparkles,
  'lock': Lock,
  'unlock': Unlock,
  'clipboard': ClipboardList,
  'newspaper': Newspaper,
  'book-check': BookOpenCheck,
  'package': Package,
  'rocket': Rocket,
  'party': PartyPopper,
  'check': Check,
  'timer': Timer,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'edit': Edit,
  'user': User,
  'heart': Heart,
  'info': Info,
  'bar-chart': BarChart3,
  'compass': Compass,
  'gem': Gem,
  'shield': Shield,
  'brain-circuit': BrainCircuit,
  'flask': FlaskConical,
  'milestone': Milestone,
};

// Renders a mapped icon by key
export const DataIcon = ({ name, size = 20, className = '', ...props }) => {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) return <CircleDot size={size} className={className} {...props} />;
  return <IconComponent size={size} className={className} {...props} />;
};

export default ICON_MAP;
