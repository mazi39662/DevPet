// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Tauri notification plugin
vi.mock('@tauri-apps/plugin-notification', () => ({
  isPermissionGranted: vi.fn().mockResolvedValue(true),
  requestPermission: vi.fn().mockResolvedValue('granted'),
  sendNotification: vi.fn(),
}));

import { notificationService } from './notifications';
import type { KeyboardSoundProfile } from '../types/settings';

describe('notificationService - Keyboard Sound Customization', () => {
  beforeEach(() => {
    notificationService.setVolume(0.8);
    notificationService.setSoundEffectsConfig({
      typing: true,
      keyboardProfile: 'clicky',
      spacebarSound: true,
      enterSound: true,
      backspaceSound: true,
      comboMilestones: true,
      turboPowerup: true,
      mascotBoop: true,
    });
  });

  it('updates and retrieves keyboard sound profile', () => {
    expect(notificationService.getSoundEffectsConfig().keyboardProfile).toBe('clicky');
    notificationService.setKeyboardProfile('thock');
    expect(notificationService.getSoundEffectsConfig().keyboardProfile).toBe('thock');

    notificationService.setKeyboardProfile('typewriter');
    expect(notificationService.getSoundEffectsConfig().keyboardProfile).toBe('typewriter');
  });

  it('handles playing all 7 keyboard switch acoustic profiles without throwing', () => {
    const profiles: KeyboardSoundProfile[] = [
      'clicky',
      'thock',
      'typewriter',
      'bubble',
      'arcade',
      'cyber',
      'muted',
    ];

    for (const profile of profiles) {
      expect(() => {
        notificationService.playKeyboardProfileSound(profile);
      }).not.toThrow();
    }
  });

  it('handles dedicated key sound effects (spacebar, enter, backspace)', () => {
    expect(() => {
      notificationService.playSpacebarSound('thock');
      notificationService.playEnterSound('typewriter');
      notificationService.playEnterSound('clicky');
      notificationService.playBackspaceSound('arcade');
    }).not.toThrow();
  });

  it('routes playKeyClick to appropriate key handlers', () => {
    expect(() => {
      notificationService.playKeyClick(' ');
      notificationService.playKeyClick('Space');
      notificationService.playKeyClick('Enter');
      notificationService.playKeyClick('Backspace');
      notificationService.playKeyClick('A');
    }).not.toThrow();
  });

  it('handles combo milestone fanfares and mascot audio', () => {
    expect(() => {
      notificationService.playComboMilestone(25);
      notificationService.playComboMilestone(50);
      notificationService.playComboMilestone(100);
      notificationService.playTurboPowerup();
      notificationService.playMascotBoop();
    }).not.toThrow();
  });
});
