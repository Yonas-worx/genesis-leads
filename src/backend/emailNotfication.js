import { customTrigger } from "@wix/automations";
import { auth } from '@wix/essentials';
import { Permissions, webMethod } from "wix-web-module";

export const runTrigger = webMethod(
  Permissions.Anyone,
  async (payload) => {
    const triggerMethod = auth.elevate(customTrigger.runTrigger);

    // Your code here
    await triggerMethod({
      triggerId: '13357145-67f6-4a42-8501-ebaf6625d8d9',
      payload,
    });
  }
);
