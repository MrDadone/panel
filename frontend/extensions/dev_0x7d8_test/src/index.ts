import { Extension, ExtensionContext } from 'shared';
import NewConsoleDetailCard from './NewConsoleDetailCard.tsx';
import PrependComponent from './PrependComponent.tsx';
import TerminalButton from './TerminalButton.tsx';

class TestExtension extends Extension {
  public initialize(ctx: ExtensionContext): void {
    console.log(`Test extension initialized. (${this.packageName})`);

    ctx.extensionRegistry.pages.server
      .enterConsole((console) => console.addStatCard(NewConsoleDetailCard).addTerminalInputRowComponent(TerminalButton))
      .prependComponent(PrependComponent);
  }

  public processCall(ctx: ExtensionContext, name: string, args: object) {
    return ctx.skip();
  }
}

export default new TestExtension();
