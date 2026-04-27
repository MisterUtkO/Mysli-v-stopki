import { NativeModule, requireNativeModule } from "expo";

declare class HomeWidgetModule extends NativeModule {
  updateWidget(): Promise<void>;
  requestWidgetUpdate(): Promise<void>;
}

export default requireNativeModule("HomeWidgetModule") as HomeWidgetModule;
