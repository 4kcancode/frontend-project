
import React, { FC, useState } from "react";
import { Block, Elem } from "../../../utils/bem";

import "./ConfigControl.styl";
import { IconConfig } from "../../../assets/icons/timeline";
import { ControlButton } from "../Controls";
import { Slider } from './Slider';

const MAX_SPEED = 250;
const MAX_ZOOM = 150;
=======
import React, { FC, MouseEvent, useEffect, useState } from 'react';
import { Block, Elem } from '../../../utils/bem';

import './ConfigControl.styl';
import { IconConfig } from '../../../assets/icons/timeline';
import { ControlButton } from '../Controls';
import { Slider } from './Slider';

const MAX_SPEED = 2.5;
const MAX_ZOOM = 150;
const MIN_SPEED = 0.5;
const MIN_ZOOM = 1;

export interface ConfigControlProps {
  configModal: boolean;
  speed: number;
  zoom: number;
  onSetModal?: () => void;
  onSpeedChange: (speed: number) => void;
  onZoom: (zoom: number) => void;
=======
  amp: number;
  onSetModal?: (e: MouseEvent<HTMLButtonElement>) => void;
  onSpeedChange: (speed: number) => void;
  onAmpChange: (amp: number) => void;
  toggleVisibility?: (layerName: string, isVisible: boolean) => void;
  layerVisibility?: Map<string, boolean>;
}

export const ConfigControl: FC<ConfigControlProps> = ({
  configModal,
  speed,
  zoom,
  onSpeedChange,
  onSetModal,
  onZoom,
  ...props
}) => {
  const [playbackSpeed, setplaybackSpeed] = useState(100);
  const [isTimeline, setTimeline] = useState(true);
  const [isAudioWave, setAudioWave] = useState(true);
  const [isAudioTrack, setAudioTrack] = useState(true);

  const handleSetTimeline = () => {
    setTimeline(!isTimeline);

    console.log('hide/show timeline');
=======
  amp,
  onSpeedChange,
  onSetModal,
  onAmpChange,
  toggleVisibility,
  layerVisibility,
}) => {
  const playbackSpeed = speed ?? 1;
  const [isTimeline, setTimeline] = useState(true);
  const [isAudioWave, setAudioWave] = useState(true);

  useEffect(() => {
    if (layerVisibility) {
      const defaultDisplay = true;

      setTimeline(layerVisibility?.get?.('timeline') ?? defaultDisplay);
      setAudioWave(layerVisibility?.get?.('waveform') ?? defaultDisplay);
    }
  }, [layerVisibility]);
  

  const handleSetTimeline = () => {
    setTimeline(!isTimeline);
    toggleVisibility?.('timeline', !isTimeline);
  };

  const handleSetAudioWave = () => {
    setAudioWave(!isAudioWave);
    console.log('hide/show audiowave');
  };

  const handleSetAudioTrack = () => {
    setAudioTrack(!isAudioTrack);

    console.log('hide/show audiotrack');
=======
    toggleVisibility?.('waveform', !isAudioWave);
    toggleVisibility?.('regions', !isAudioWave);
  };

  const handleChangePlaybackSpeed = (e: React.FormEvent<HTMLInputElement>) => {
    const _playbackSpeed = parseFloat(e.currentTarget.value);

    if (!_playbackSpeed) {
      setplaybackSpeed(0);
    } else {
      setplaybackSpeed(_playbackSpeed);
    }

    if (!_playbackSpeed || _playbackSpeed <= 20) {
      onSpeedChange(0.6);
    } else {
      onSpeedChange(_playbackSpeed / (MAX_SPEED / 2));
    }
  };

  const handleChangeZoom = (e: React.FormEvent<HTMLInputElement>) => {
    const _zoom = parseFloat(e.currentTarget.value);

    setTimeout(() => onZoom(_zoom * 10));
  };

  const renderMuteButton = () => {
    return (
      <Elem name={"buttons"}>
=======
    if (isNaN(_playbackSpeed)) return;

    onSpeedChange(_playbackSpeed);
  };

  const handleChangeAmp = (e: React.FormEvent<HTMLInputElement>) => {
    const _amp = parseFloat(e.currentTarget.value);

    onAmpChange(_amp);
  };

  const renderLayerToggles = () => {
    return (
      <Elem name={'buttons'}>
        <Elem
          name="menu-button"
          onClick={handleSetTimeline}
        >
          { isTimeline ? 'Show' : 'Hide' } timeline
=======
          { isTimeline ? 'Hide' : 'Show' } timeline
        </Elem>
        <Elem
          name="menu-button"
          onClick={handleSetAudioWave}
        >
          { isAudioWave ? 'Show' : 'Hide' } audio wave
        </Elem>
        <Elem
          name="menu-button"
          onClick={handleSetAudioTrack}
        >
          { isAudioTrack ? 'Show' : 'Hide' } audio track
=======
          { isAudioWave ? 'Hide' : 'Show' } audio wave
        </Elem>
      </Elem>
    );
  };

  const renderModal = () => {
    return (
      <Elem name="modal">
        <Slider
          min={50}
          max={MAX_SPEED}
          value={playbackSpeed}
          description={"Playback speed"}
          info={"Increase or decrease the playback speed"}
          onChange={handleChangePlaybackSpeed}
        />
        <Slider
          min={0}
          max={MAX_ZOOM}
          value={zoom / 10}
          description={"Audio zoom y-axis"}
          info={"Increase or decrease the appearance of amplitude"}
          onChange={handleChangeZoom}
        />
        {renderMuteButton()}
=======
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={0.1}
          value={playbackSpeed}
          description={'Playback speed'}
          info={'Increase or decrease the playback speed'}
          onChange={handleChangePlaybackSpeed}
        />
        <Slider
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.1}
          value={amp}
          description={'Audio zoom y-axis'}
          info={'Increase or decrease the appearance of amplitude'}
          onChange={handleChangeAmp}
        />
        {renderLayerToggles()}
      </Elem>
    );
  };

  return (
    <Block name="audio-config">
=======
    <Block name="audio-config" onClick={(e: MouseEvent<HTMLButtonElement>) => e.stopPropagation()}>
      <ControlButton
        look={configModal ? 'active' : undefined}
        onClick={onSetModal}
      >
        {<IconConfig/>}
      </ControlButton>
      {configModal && renderModal()}
    </Block>
  );
};
