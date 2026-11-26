import { useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { hexToRgb, hsvToHex, rgbToHsv, type Rgb } from "../colorValues";

type Props = { anchor: HTMLButtonElement; color: string; automaticColor: string; onChoose: (color: string) => void; onDefault: () => void; onClose: () => void };
export function ScheduleColorPicker(props: Props) {
  const [hsv, setHsv] = useState(() => rgbToHsv(hexToRgb(props.color)));
  const dialog = useRef<HTMLDialogElement>(null);
  const color = hsvToHex(hsv), rgb = hexToRgb(color);
  useLayoutEffect(() => {
    const element = dialog.current!;
    element.showModal();
    const anchor = props.anchor.getBoundingClientRect(), rect = element.getBoundingClientRect();
    const viewport = element.ownerDocument.documentElement;
    const top = anchor.bottom + 8 + rect.height <= viewport.clientHeight - 12 ? anchor.bottom + 8 : Math.max(12, anchor.top - rect.height - 8);
    element.style.left = `${Math.max(12, Math.min(anchor.left, viewport.clientWidth - rect.width - 12))}px`;
    element.style.top = `${Math.min(top, Math.max(12, viewport.clientHeight - rect.height - 12))}px`;
    return () => element.close();
  }, [props.anchor]);
  function pickPoint(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setHsv(current => ({ ...current, s: Math.min(100, Math.max(0, (event.clientX - rect.left) / rect.width * 100)), v: Math.min(100, Math.max(0, 100 - (event.clientY - rect.top) / rect.height * 100)) }));
  }
  function changeChannel(channel: keyof Rgb, value: string) {
    if (value === "" || !Number.isFinite(Number(value))) return;
    setHsv(rgbToHsv({ ...rgb, [channel]: Math.min(255, Math.max(0, Math.round(Number(value)))) }));
  }
  return <dialog ref={dialog} className="schedule-color-picker" aria-labelledby="color-picker-title"
    onCancel={event => { event.preventDefault(); event.stopPropagation(); props.onClose(); }}
    onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) props.onClose(); } }}>
    <div className="picker-heading"><h3 id="color-picker-title">색상 선택</h3><button type="button" aria-label="색상 선택 닫기" onClick={props.onClose}>×</button></div>
    <div className="picker-plane" role="group" aria-label="채도와 명도 선택" aria-describedby="color-picker-help" tabIndex={0}
      style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
      onPointerDown={event => { event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); pickPoint(event); }}
      onPointerMove={event => { if (event.buttons === 1) pickPoint(event); }}
      onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) { event.preventDefault(); const step = event.shiftKey ? 10 : 1; setHsv(current => ({ ...current, s: Math.min(100, Math.max(0, current.s + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0))), v: Math.min(100, Math.max(0, current.v + (event.key === "ArrowUp" ? step : event.key === "ArrowDown" ? -step : 0))) })); } }}>
      <span className="picker-cursor" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, background: color }} />
    </div>
    <p id="color-picker-help" className="picker-help">방향키로 채도·명도 조절 · Shift로 크게 조절</p>
    <input className="picker-hue" type="range" aria-label="색상 각도" min={0} max={360} step={1} value={hsv.h} onChange={event => setHsv(current => ({ ...current, h: Number(event.target.value) }))} />
    <div className="picker-preview"><span style={{ background: color }} /><output aria-live="polite">{color}</output></div>
    <div className="picker-rgb">{(["r", "g", "b"] as const).map(channel => <label key={channel}>{channel.toUpperCase()}<input type="number" min={0} max={255} step={1} aria-label={channel.toUpperCase()} value={rgb[channel]} onChange={event => changeChannel(channel, event.target.value)} /></label>)}</div>
    <div className="picker-actions"><button type="button" className="cancel-button" onClick={props.onClose}>취소</button><button type="button" className="save-button" onClick={() => props.onChoose(color)}>선택</button></div>
    <button type="button" className="picker-default" aria-label="기본값" title="설정의 단계별 자동 색상을 따릅니다" onClick={props.onDefault}><span style={{ background: props.automaticColor }} />기본값<small>단계별 색상</small></button>
  </dialog>;
}
