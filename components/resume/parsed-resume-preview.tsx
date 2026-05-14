import { FileBadge2, GraduationCap, BriefcaseBusiness, FolderKanban, Award, Mail, Phone, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatFileSize } from "@/lib/validations/resume-validation";
import type { StoredResume } from "@/types/resume";

interface ParsedResumePreviewProps {
  resume: StoredResume;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function ParsedResumePreview({
  resume,
  onDelete,
  isDeleting = false,
}: ParsedResumePreviewProps) {
  const { metadata, parsedData } = resume;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-border/60 bg-card/70">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {parsedData.fullName ?? metadata.fileName}
              </CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {parsedData.headline ?? "Structured profile extracted from your latest resume upload."}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary">Latest upload</Badge>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={onDelete}
                  disabled={isDeleting}
                  title="Delete resume"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetadataItem label="File name" value={metadata.fileName} icon={FileBadge2} />
            <MetadataItem label="File size" value={formatFileSize(metadata.fileSize)} icon={FileBadge2} />
            <MetadataItem label="File type" value={metadata.fileType} icon={FileBadge2} />
            <MetadataItem
              label="Uploaded"
              value={new Date(resume.createdAt).toLocaleString()}
              icon={FileBadge2}
            />
          </div>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Contact</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetadataItem
                label="Email"
                value={parsedData.email ?? "Not detected"}
                icon={Mail}
              />
              <MetadataItem
                label="Phone"
                value={parsedData.phoneNumber ?? "Not detected"}
                icon={Phone}
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Extracted skills</p>
            <div className="flex flex-wrap gap-2">
              {resume.extractedSkills.length > 0 ? (
                resume.extractedSkills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills were extracted from this resume.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <SectionCard
          title="Experience"
          icon={BriefcaseBusiness}
          items={parsedData.experience}
        />
        <SectionCard
          title="Projects"
          icon={FolderKanban}
          items={parsedData.projects}
        />
        <SectionCard
          title="Education"
          icon={GraduationCap}
          items={parsedData.education}
        />
        <SectionCard
          title="Certifications"
          icon={Award}
          items={parsedData.certifications}
        />
      </div>
    </div>
  );
}

function MetadataItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof FileBadge2;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 break-words text-sm font-medium leading-6">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof FileBadge2;
  items: string[];
}) {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {items.map((item) => (
              <li key={item} className="rounded-2xl border border-border/50 bg-background/60 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No {title.toLowerCase()} entries were detected.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
