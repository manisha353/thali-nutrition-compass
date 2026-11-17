import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  FileImage,
  Flame,
  Leaf,
  LoaderCircle,
  Salad,
  ScanLine,
  Sparkles,
  Upload,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import sampleThali from "@/assets/indian-thali-example.jpg";
import { analyzeNutrition } from "@/lib/nutrition.functions";
import { sumNutrition, type NutritionResponse } from "@/lib/nutrition-schema";

type Photo = { src: string; file: File | null; isSample: boolean };

const sampleItems = [
  {
    name: "Yellow dal",
    serving: "1 katori · about 180 g",
    calories: 165,
    proteinGrams: 9,
    carbsGrams: 22,
    fatGrams: 4,
    fiberGrams: 6,
    sugarGrams: 2,
    sodiumMilligrams: 320,
    confidence: 0.92,
  },
  {
    name: "Palak paneer",
    serving: "1 katori · about 160 g",
    calories: 210,
    proteinGrams: 12,
    carbsGrams: 9,
    fatGrams: 14,
    fiberGrams: 2,
    sugarGrams: 3,
    sodiumMilligrams: 390,
    confidence: 0.89,
  },
  {
    name: "Basmati rice",
    serving: "1 cup · about 160 g",
    calories: 185,
    proteinGrams: 4,
    carbsGrams: 40,
    fatGrams: 0.4,
    fiberGrams: 1,
    sugarGrams: 0.1,
    sodiumMilligrams: 5,
    confidence: 0.96,
  },
  {
    name: "Whole-wheat roti",
    serving: "2 rotis · about 100 g",
    calories: 210,
    proteinGrams: 6,
    carbsGrams: 40,
    fatGrams: 3,
    fiberGrams: 5,
    sugarGrams: 1,
    sodiumMilligrams: 260,
    confidence: 0.88,
  },
  {
    name: "Raita",
    serving: "½ cup · about 100 g",
    calories: 70,
    proteinGrams: 4,
    carbsGrams: 6,
    fatGrams: 3,
    fiberGrams: 0,
    sugarGrams: 5,
    sodiumMilligrams: 75,
    confidence: 0.91,
  },
  {
    name: "Papad, chutney & salad",
    serving: "1 papad with small sides",
    calories: 85,
    proteinGrams: 3,
    carbsGrams: 12,
    fatGrams: 2,
    fiberGrams: 2,
    sugarGrams: 2,
    sodiumMilligrams: 285,
    confidence: 0.78,
  },
];

const sampleAnalysis: NutritionResponse & { totals: ReturnType<typeof sumNutrition> } = {
  isFood: true,
  mealName: "A little bit of everything",
  summary: "A balanced thali with lentils, leafy greens, rice, roti and cool raita.",
  items: sampleItems,
  totals: sumNutrition(sampleItems),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Platewise — Food photo nutrition scanner" },
      {
        name: "description",
        content: "See estimated calories and nutrition for a single dish or every item on your thali.",
      },
      { property: "og:title", content: "Platewise — Food photo nutrition scanner" },
      {
        property: "og:description",
        content: "See estimated calories and nutrition for a single dish or every item on your thali.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap",
      },
    ],
  }),
  component: Index,
});

function readAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("This photo could not be read."));
    };
    reader.onerror = () => reject(new Error("This photo could not be read."));
    reader.readAsDataURL(blob);
  });
}

function Index() {
  const inputRef = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzeNutrition);
  const [photo, setPhoto] = useState<Photo>({ src: sampleThali, file: null, isSample: true });
  const [analysis, setAnalysis] = useState(sampleAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const selectPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP photo.");
      return;
    }
    setPhoto({ src: URL.createObjectURL(file), file, isSample: false });
    setAnalysis({
      isFood: true,
      mealName: "Ready to scan",
      summary: "Your new photo is ready for an estimate.",
      items: [],
      totals: sumNutrition([]),
    });
    setError("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectPhoto(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    selectPhoto(event.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError("");
    try {
      let blob: Blob;
      if (photo.file) {
        blob = photo.file;
      } else {
        const response = await fetch(sampleThali);
        if (!response.ok) throw new Error("The sample photo could not be loaded.");
        blob = await response.blob();
      }
      const imageDataUrl = await readAsDataUrl(blob);
      const result = await analyze({ data: { imageDataUrl } });
      setAnalysis(result);
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "We couldn’t read that photo. Try a clear, well-lit picture of your food.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasItems = analysis.items.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/70">
        <div className="page-shell flex h-[4.5rem] items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="Platewise home">
            <span className="brand-mark"><Leaf size={19} strokeWidth={2.2} /></span>
            <span className="text-lg font-bold">platewise</span>
          </a>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles size={14} className="text-primary" />
            <span>Food, made clearer</span>
          </div>
        </div>
      </header>

      <main id="top" className="page-shell pb-12 pt-8 sm:pb-16 sm:pt-11">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary">
              <ScanLine size={15} />
              Meal scanner
            </div>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">Know your plate.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              A quick look at what’s in your meal, from one bowl to a full thali.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
            <span>Nutrition estimates, not a medical assessment</span>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)] lg:gap-6">
          <section className="overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5" aria-label="Meal photo">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Your meal</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">A clear photo helps with portion estimates.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                <Utensils size={13} />
                Single dish or thali
              </span>
            </div>

            <div
              className={`image-frame ${isDragging ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <img src={photo.src} alt={photo.isSample ? "An example Indian thali with dal, palak paneer, rice, roti, raita and sides" : "Selected meal photo"} width={1024} height={1024} />
              <span className="photo-badge">
                <FileImage size={14} />
                {photo.isSample ? "Example thali" : "Your photo"}
              </span>
              {isDragging && (
                <div className="absolute inset-0 grid place-items-center bg-background/85 text-sm font-semibold text-primary">
                  Drop your meal photo
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Choose a food photo"
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => inputRef.current?.click()} className="h-11 flex-1">
                <Upload size={16} />
                Choose a photo
              </Button>
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="h-11 flex-1">
                {isAnalyzing ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isAnalyzing ? "Reading your plate…" : "Analyze this meal"}
                {!isAnalyzing && <ChevronRight size={16} />}
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              JPG, PNG or WebP · Your photo is analyzed securely and not saved
            </p>
            {error && (
              <div role="alert" className="mt-3 flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {isAnalyzing && (
              <div className="scan-skeleton mt-4 flex items-center gap-3 rounded-md bg-secondary/70 p-3 text-sm text-secondary-foreground" role="status">
                <Activity size={17} className="text-primary" />
                <span>Looking for each dish and estimating serving sizes…</span>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5" aria-label="Nutrition results" aria-live="polite">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold text-success-foreground">
                  <Check size={13} />
                  {photo.isSample ? "Example estimate" : hasItems ? "Meal analyzed" : "Ready to scan"}
                </div>
                <h2 className="font-display text-2xl leading-tight">{analysis.mealName}</h2>
                <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{analysis.summary}</p>
              </div>
              <span className="food-dot" style={{ "--food-tint": "var(--success)", "--food-color": "var(--success-foreground)" } as React.CSSProperties}>
                <Salad size={19} />
              </span>
            </div>

            {isAnalyzing ? (
              <div className="mb-4 space-y-3 rounded-md border border-border p-4">
                <div className="h-8 w-28 rounded bg-muted" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 rounded bg-muted" />
                  <div className="h-16 rounded bg-muted" />
                </div>
              </div>
            ) : !analysis.isFood ? (
              <div className="mb-4 rounded-md border border-border bg-muted/40 px-4 py-6 text-center">
                <CircleHelp size={24} className="mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">No food spotted</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a brighter photo with the food in view.</p>
              </div>
            ) : hasItems ? (
              <>
                <div className="mb-3 flex items-center justify-between rounded-md bg-primary px-4 py-3.5 text-primary-foreground">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] opacity-80">Estimated energy</p>
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold tabular-nums">{analysis.totals.calories.toLocaleString()}</span>
                      <span className="text-sm font-medium opacity-90">kcal total</span>
                    </div>
                  </div>
                  <span className="calorie-disc"><Flame size={22} /></span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <NutritionTile label="Protein" amount={analysis.totals.proteinGrams} unit="g" tone="protein" />
                  <NutritionTile label="Carbs" amount={analysis.totals.carbsGrams} unit="g" tone="carbohydrate" />
                  <NutritionTile label="Fat" amount={analysis.totals.fatGrams} unit="g" tone="fat" />
                  <NutritionTile label="Fiber" amount={analysis.totals.fiberGrams} unit="g" tone="fiber" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border pb-4 text-xs text-muted-foreground">
                  <span>Sugars <strong className="font-semibold text-foreground">{analysis.totals.sugarGrams} g</strong></span>
                  <span>Sodium <strong className="font-semibold text-foreground">{analysis.totals.sodiumMilligrams} mg</strong></span>
                  <span className="ml-auto inline-flex items-center gap-1"><CircleHelp size={12} /> Estimated values</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">What’s on your plate</h3>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">{analysis.items.length}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Portion estimates</span>
                </div>
                <div className="mt-2 divide-y divide-border">
                  {analysis.items.map((item, index) => (
                    <FoodRow key={`${item.name}-${index}`} item={item} index={index} />
                  ))}
                </div>
                <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/55 p-3 text-[11px] leading-4 text-muted-foreground">
                  <CircleHelp size={14} className="mt-0.5 shrink-0" />
                  <p>Photo-based estimates can vary with ingredients and portion size. Check packaging or a nutrition professional for precise values.</p>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-5 text-center">
                <Utensils size={22} className="mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">Your plate is ready</p>
                <p className="mt-1 text-xs text-muted-foreground">Scan the photo to see calories and nutrition for each dish.</p>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-5 flex flex-col gap-2 border-t border-border/70 pt-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-1.5"><Leaf size={13} className="text-primary" /> Made for meals with many little parts.</span>
          <span>Estimates are for general information, not medical advice.</span>
        </footer>
      </main>
    </div>
  );
}

function NutritionTile({
  label,
  amount,
  unit,
  tone,
}: {
  label: string;
  amount: number;
  unit: string;
  tone: "protein" | "carbohydrate" | "fat" | "fiber";
}) {
  const toneClasses = {
    protein: "bg-protein",
    carbohydrate: "bg-carbohydrate",
    fat: "bg-fat",
    fiber: "bg-fiber",
  };

  return (
    <div className="nutrition-tile">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${toneClasses[tone]}`} />
        {label}
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums">
        {amount} <span className="text-xs font-medium text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function FoodRow({ item, index }: { item: NutritionResponse["items"][number]; index: number }) {
  const palette = [
    { color: "var(--protein)", tint: "color-mix(in oklab, var(--protein) 12%, var(--card))" },
    { color: "var(--carbohydrate)", tint: "color-mix(in oklab, var(--carbohydrate) 13%, var(--card))" },
    { color: "var(--fiber)", tint: "color-mix(in oklab, var(--fiber) 12%, var(--card))" },
    { color: "var(--fat)", tint: "color-mix(in oklab, var(--fat) 12%, var(--card))" },
  ];
  const color = palette[index % palette.length] ?? {
    color: "var(--protein)",
    tint: "color-mix(in oklab, var(--protein) 12%, var(--card))",
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <span className="food-dot" style={{ "--food-tint": color.tint, "--food-color": color.color } as React.CSSProperties}>
        <Utensils size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{item.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{item.serving} · P {item.proteinGrams} g · C {item.carbsGrams} g · F {item.fatGrams} g</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold tabular-nums">{item.calories} <span className="text-[10px] font-medium text-muted-foreground">kcal</span></p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{Math.round(item.confidence * 100)}% match</p>
      </div>
    </div>
  );
}
