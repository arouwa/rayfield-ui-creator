export type ElementType = 'Button' | 'Toggle' | 'Slider' | 'Input' | 'Label' | 'Paragraph' | 'Keybind' | 'Dropdown';

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
}

export interface RayfieldButton extends BaseElement {
  type: 'Button';
  callbackLogic: string; // The Lua code inside the function
}

export interface RayfieldToggle extends BaseElement {
  type: 'Toggle';
  default: boolean;
  callbackLogic: string;
}

export interface RayfieldSlider extends BaseElement {
  type: 'Slider';
  min: number;
  max: number;
  default: number;
  suffix: string;
  callbackLogic: string;
}

export interface RayfieldInput extends BaseElement {
  type: 'Input';
  placeholder: string;
  removeTextAfterFocusLost: boolean;
  callbackLogic: string;
}

export interface RayfieldLabel extends BaseElement {
  type: 'Label';
  color?: string;
}

export interface RayfieldParagraph extends BaseElement {
  type: 'Paragraph';
  content: string;
}

export interface RayfieldKeybind extends BaseElement {
  type: 'Keybind';
  defaultKey: string;
  holdToInteract: boolean;
  callbackLogic: string;
}

export interface RayfieldDropdown extends BaseElement {
  type: 'Dropdown';
  options: string[]; // Comma separated in UI, array in structure
  defaultOption: string; // Name or index? Usually option name in Rayfield
  multiSelection: boolean;
  callbackLogic: string;
}

export type UIElement = 
  | RayfieldButton 
  | RayfieldToggle 
  | RayfieldSlider 
  | RayfieldInput 
  | RayfieldLabel 
  | RayfieldParagraph
  | RayfieldKeybind
  | RayfieldDropdown;

export interface RayfieldTab {
  id: string;
  name: string;
  icon: string; // ID or asset string
  elements: UIElement[];
}

export interface RayfieldWindow {
  name: string;
  loadingTitle: string;
  loadingSubtitle: string;
  configurationSaving: {
    enabled: boolean;
    folderName: string;
    fileName: string;
  };
  keySystem: boolean;
  keySettings: {
    title: string;
    subtitle: string;
    note: string;
    fileName: string;
    saveKey: boolean;
    grabbingKey: string;
    key: string;
  };
}

export interface AppState {
  window: RayfieldWindow;
  tabs: RayfieldTab[];
}