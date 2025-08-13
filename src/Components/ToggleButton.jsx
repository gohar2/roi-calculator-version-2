import * as Switch from '@radix-ui/react-switch';

function ToggleButton({ checked, onCheckedChange }) {
  return (
    <div className="toggle-button-container flex items-center space-x-2">
        <label htmlFor="toggle" className="text-sm text-gray-700 font-medium">Detailed ROI</label>
        <Switch.Root 
        id="toggle"
        checked={checked} 
        onCheckedChange={onCheckedChange}
        className={`w-11 h-6 ${checked ? "bg-lightGreen" : "bg-zinc-400"}  rounded-full relative data-[state=checked]:toggle-button-bg outline-none cursor-pointer`}
        >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
        </Switch.Root>
    </div>
  );
}
export default ToggleButton;