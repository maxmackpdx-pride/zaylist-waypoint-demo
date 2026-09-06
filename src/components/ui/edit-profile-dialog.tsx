"use client";

import { useId, useState } from "react";
import { Check, ImagePlus, X } from "lucide-react";
import { useCharacterLimit } from "@/components/hooks/use-character-limit";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DarkProfile } from "@/lib/zaydark";

const field =
  "border-white/15 bg-black text-white placeholder:text-white/35 focus-visible:border-[#ff2400] focus-visible:ring-[#ff2400]/25";

export function EditProfileDialog({
  me,
  onSave,
}: {
  me: DarkProfile;
  onSave: (next: DarkProfile) => void;
}) {
  const id = useId();
  const maxLength = 180;
  const bio = useCharacterLimit({ maxLength, initialValue: me.about });
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState(me.host);
  const [age, setAge] = useState(String(me.age));
  const [height, setHeight] = useState(me.height ?? "");
  const cover = useImageUpload();
  const avatar = useImageUpload();

  function save() {
    onSave({
      ...me,
      host: host.trim() || me.host,
      age: Math.max(18, Number(age) || me.age),
      height: height.trim() || undefined,
      about: bio.value,
      coverUrl: cover.previewUrl ?? me.coverUrl,
      photoUrl: avatar.previewUrl ?? me.photoUrl,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 w-full rounded-2xl bg-[#ff2400] font-display text-sm font-black tracking-[0.14em] text-white hover:bg-[#ff2400]/90">
          EDIT PROFILE
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible border-white/10 bg-black p-0 text-white sm:max-w-lg [&>button:last-child]:top-3.5 [&>button:last-child]:text-white">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-white/10 px-6 py-4 font-display text-base font-black uppercase tracking-wide">
            Edit Dark
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Cover, face, handle, about. Same city. Different hunger.
        </DialogDescription>
        <div className="overflow-y-auto">
          <ProfileBg defaultImage={me.coverUrl} upload={cover} />
          <Avatar defaultImage={me.photoUrl} upload={avatar} />
          <div className="px-6 pb-6 pt-4">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor={`${id}-handle`} className="text-white/70">
                  Handle
                </Label>
                <div className="relative">
                  <Input
                    id={`${id}-handle`}
                    className={`${field} peer pe-9`}
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
                    <Check size={16} className="text-[#ff2400]" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-age`} className="text-white/70">
                    Age
                  </Label>
                  <Input id={`${id}-age`} className={field} type="number" min={18} max={99} value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-height`} className="text-white/70">
                    Height
                  </Label>
                  <Input id={`${id}-height`} className={field} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="5'11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-bio`} className="text-white/70">
                  About
                </Label>
                <Textarea
                  id={`${id}-bio`}
                  className={field}
                  value={bio.value}
                  maxLength={maxLength}
                  onChange={bio.handleChange}
                />
                <p className="text-right text-xs text-white/40">
                  <span className="tabular-nums">{bio.maxLength - bio.characterCount}</span> left
                </p>
              </div>
            </form>
          </div>
        </div>
        <DialogFooter className="border-t border-white/10 px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={save} className="bg-[#ff2400] text-white hover:bg-[#ff2400]/90">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileBg({
  defaultImage,
  upload,
}: {
  defaultImage?: string;
  upload: ReturnType<typeof useImageUpload>;
}) {
  const [hideDefault, setHideDefault] = useState(false);
  const current = upload.previewUrl || (!hideDefault ? defaultImage : null);
  return (
    <div className="h-32">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#111]">
        {current ? <img className="h-full w-full object-cover" src={current} alt="" /> : <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_30%_20%,#3a0a0a_0%,#050506_70%)]" />}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button type="button" className="z-50 flex size-10 items-center justify-center rounded-full bg-black/60 text-white" onClick={upload.handleThumbnailClick} aria-label="Upload cover">
            <ImagePlus size={16} />
          </button>
          {current ? (
            <button
              type="button"
              className="z-50 flex size-10 items-center justify-center rounded-full bg-black/60 text-white"
              onClick={() => {
                upload.handleRemove();
                setHideDefault(true);
              }}
              aria-label="Remove cover"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>
      <input type="file" ref={upload.fileInputRef} onChange={upload.handleFileChange} className="hidden" accept="image/*" />
    </div>
  );
}

function Avatar({
  defaultImage,
  upload,
}: {
  defaultImage?: string;
  upload: ReturnType<typeof useImageUpload>;
}) {
  const current = upload.previewUrl || defaultImage;
  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-black bg-[#111]">
        {current ? <img src={current} className="h-full w-full object-cover" alt="" /> : <span className="font-display text-2xl font-black text-white">Z</span>}
        <button type="button" className="absolute flex size-8 items-center justify-center rounded-full bg-black/60 text-white" onClick={upload.handleThumbnailClick} aria-label="Change face">
          <ImagePlus size={16} />
        </button>
        <input type="file" ref={upload.fileInputRef} onChange={upload.handleFileChange} className="hidden" accept="image/*" />
      </div>
    </div>
  );
}