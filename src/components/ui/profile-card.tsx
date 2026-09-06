"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Clock, MessageCircle, User, Waves, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileCardProps {
  name?: string;
  description?: string;
  image?: string;
  isVerified?: boolean;
  followers?: number;
  following?: number;
  enableAnimations?: boolean;
  className?: string;
  onFollow?: () => void;
  isFollowing?: boolean;
  statusText?: string;
  statusLive?: boolean;
  timeText?: string;
  glowText?: string;
  role?: string;
  avatar?: ReactNode;
  photos?: ReactNode;
  stats?: ReactNode;
  into?: ReactNode;
  upcoming?: ReactNode;
  past?: ReactNode;
  extra?: ReactNode;
  onMessage?: () => void;
  onWave?: () => void;
  onFullProfile?: () => void;
  waved?: boolean;
}

export function ProfileCard({
  name = "Sophie Bennett",
  description = "Product Designer who focuses on simplicity & usability.",
  image,
  isVerified = true,
  enableAnimations = true,
  className,
  onFollow,
  isFollowing = false,
  statusText = "On the map",
  statusLive = true,
  timeText,
  glowText = "Currently on the map",
  role,
  avatar,
  photos,
  stats,
  into,
  upcoming,
  past,
  extra,
  onMessage,
  onWave,
  onFullProfile,
  waved = false,
}: ProfileCardProps) {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  return (
    <motion.div
      data-slot="profile-hover-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={shouldAnimate ? { y: -3 } : undefined}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("relative w-full max-w-sm", className)}
    >
      <div className="pointer-events-none absolute inset-x-4 -bottom-8 top-[78%] rounded-[28px] bg-[#ff2400]/70 blur-[2px] z-0" />
      <div className="absolute inset-x-0 -bottom-8 z-0 mx-auto w-full">
        <div className="flex items-center justify-center gap-2 py-3 text-center text-sm font-medium text-black">
          <Zap className="h-4 w-4" /> {glowText}
        </div>
      </div>

      <Card className="relative z-10 overflow-hidden rounded-[28px] border-0 bg-[radial-gradient(120%_120%_at_30%_10%,#1a1a1a_0%,#0f0f10_60%,#0b0b0c_100%)] text-white shadow-2xl">
        <div className="relative h-56 overflow-hidden">
          {image ? (
            <motion.img
              src={image}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
              animate={hovered && shouldAnimate ? { scale: 1.05 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_30%_20%,#3a0a0a_0%,#050506_70%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          {photos ? <div className="absolute bottom-3 left-3 right-3 z-10">{photos}</div> : null}
        </div>

        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className={cn("inline-block h-2.5 w-2.5 rounded-full", statusLive ? "animate-pulse bg-[#ff2400]" : "bg-white/30")} />
              <span>{statusText}</span>
            </div>
            {timeText ? (
              <div className="flex items-center gap-2 opacity-80">
                <Clock className="h-4 w-4" />
                <span className="tabular-nums">{timeText}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {avatar}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-2xl font-black uppercase tracking-tight">{name}</h2>
                {isVerified ? (
                  <span className="grid size-4 place-items-center rounded-full bg-[#ff2400] text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                ) : null}
              </div>
              {role ? <p className="mt-0.5 text-sm text-white/55">{role}</p> : null}
            </div>
          </div>

          {description ? <p className="text-sm leading-relaxed text-white/75">{description}</p> : null}
          {stats}
          {into}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={onMessage}
              className="h-11 justify-center gap-2 rounded-2xl bg-[#ff2400] text-white hover:bg-[#ff2400]/90"
            >
              <MessageCircle className="h-4 w-4" /> Message
            </Button>
            <Button
              variant="secondary"
              onClick={onWave ?? onFollow}
              className="h-11 justify-center gap-2 rounded-2xl bg-white/10 text-white hover:bg-white/15"
            >
              <Waves className="h-4 w-4" /> {waved || isFollowing ? "Waved" : "Wave"}
            </Button>
          </div>
          <Button
            variant="secondary"
            onClick={onFullProfile}
            className="h-11 w-full justify-center gap-2 rounded-2xl bg-white text-black hover:bg-white/90"
          >
            <User className="h-4 w-4" /> Full Zaylist profile
          </Button>

          {upcoming}
          {past}
          {extra}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ProfileCard;