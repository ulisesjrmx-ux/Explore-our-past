import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Compass, EyeOff, Fuel, HelpCircle, Rocket, Shield } from 'lucide-react';
import { Language, PlanetId } from '../types/game';
import { UI_TEXT } from '../utils/i18n';

interface MissionGuideBannerProps {
  lang: Language;
  planetId: PlanetId;
  planetName: string;
  targetPlanetName: string;
  activeTargetName: string | null;
  rescuedCount: number;
  totalCount: number;
  boostEnergy: number;
  hull: number;
  missionComplete: boolean;
}

export const MissionGuideBanner: React.FC<MissionGuideBannerProps> = ({
  lang,
  planetId,
  planetName,
  targetPlanetName,
  activeTargetName,
  rescuedCount,
  totalCount,
  boostEnergy,
  hull,
  missionComplete,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [manualStep, setManualStep] = useState<number | null>(null);
  const t = UI_TEXT[lang];

  const steps = useMemo(() => {
    const targetDisplay = activeTargetName ?? (lang === 'es' ? 'la sonda activa' : 'the active probe');
    const step4 =
      planetId === 'moon' && missionComplete
        ? t.guideSteps.launchNext(planetName, targetPlanetName)
        : planetId === 'mars'
        ? t.guideSteps.finishAll
        : t.guideSteps.launchNext(planetName, targetPlanetName);

    return [
      {
        key: 'target',
        icon: Compass,
        accent: planetId === 'moon' ? 'text-cyan-300' : 'text-amber-300',
        boxClass: planetId === 'moon' ? 'crayon-box-moon' : 'crayon-box-mars',
        ...t.guideSteps.collectTarget(planetName, targetDisplay, rescuedCount, totalCount),
      },
      {
        key: 'fuel',
        icon: Fuel,
        accent: 'text-emerald-300',
        boxClass: 'crayon-box-emerald',
        ...t.guideSteps.collectFuel,
      },
      {
        key: 'meteors',
        icon: Shield,
        accent: 'text-amber-300',
        boxClass: 'crayon-box-mars',
        ...t.guideSteps.dodgeMeteors,
      },
      {
        key: 'launch',
        icon: Rocket,
        accent: 'text-sky-300',
        boxClass: 'crayon-box-slate',
        ...step4,
      },
    ];
  }, [activeTargetName, lang, missionComplete, planetId, planetName, rescuedCount, t, targetPlanetName, totalCount]);

  // Smart automatic step selection based on current mission progress
  const autoStepIndex = useMemo(() => {
    if (missionComplete && planetId === 'moon') return 3;
    if (boostEnergy <= 62) return 1;
    if (hull < 80) return 2;
    if (rescuedCount === 1) return 1; // Remind about gas after 1st object
    if (rescuedCount >= 2 && planetId === 'mars' && rescuedCount >= totalCount - 2) return 3;
    if (rescuedCount >= 2) return 2;
    return 0;
  }, [boostEnergy, hull, missionComplete, planetId, rescuedCount, totalCount]);

  const activeIndex = manualStep !== null ? manualStep % steps.length : autoStepIndex;
  const activeStep = steps[activeIndex];
  const Icon = activeStep.icon;

  if (!expanded) {
    return (
      <div className="pointer-events-auto absolute top-[132px] left-3 z-10">
        <button
          type="button"
          onClick={() => {
            setManualStep(null);
            setExpanded(true);
          }}
          className="crayon-btn crayon-btn-dark inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold cursor-pointer shadow-lg"
          title={t.guideBadge}
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-300" />
          <span>{t.guideShowBtn}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute top-[132px] left-3 z-10 w-[238px] sm:w-[270px] xl:w-[290px]">
      <div className={`crayon-box ${activeStep.boxClass} p-3 shadow-xl`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-crayon text-xs font-bold text-slate-300">
            <Icon className={`w-3.5 h-3.5 shrink-0 ${activeStep.accent}`} />
            <span>{t.guideBadge}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono-tabular text-[11px] text-slate-200">
              {t.guideStepLabel(activeIndex + 1, steps.length)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="crayon-btn crayon-btn-ghost inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold cursor-pointer"
            title={t.guideHideBtn}
          >
            <EyeOff className="w-3 h-3" />
            <span>{t.guideHideBtn}</span>
          </button>
        </div>

        <div className={`font-crayon text-base font-bold leading-snug mt-1.5 ${activeStep.accent}`}>
          {activeStep.title}
        </div>
        <p className="font-crayon text-[13px] text-slate-200 leading-snug mt-1">
          {activeStep.body}
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          {/* Crayon step bars */}
          <div className="flex items-center gap-1" aria-hidden="true">
            {steps.map((step, idx) => (
              <button
                key={step.key}
                type="button"
                onClick={() => setManualStep(idx)}
                className={`h-1.5 w-5 cursor-pointer transition-colors ${
                  idx === activeIndex
                    ? 'bg-amber-300'
                    : 'bg-slate-600/80 hover:bg-slate-400'
                }`}
                aria-label={t.guideStepLabel(idx + 1, steps.length)}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setManualStep((activeIndex - 1 + steps.length) % steps.length)}
              className="crayon-btn crayon-btn-dark p-1 cursor-pointer"
              aria-label={t.guidePrevAria}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setManualStep((activeIndex + 1) % steps.length)}
              className="crayon-btn crayon-btn-dark p-1 cursor-pointer"
              aria-label={t.guideNextAria}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
