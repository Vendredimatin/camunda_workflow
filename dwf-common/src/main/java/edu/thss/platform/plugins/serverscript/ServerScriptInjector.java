package edu.thss.platform.plugins.serverscript;

import edu.thss.platform.example.RabbitMock;
import edu.thss.platform.service.omf.ScriptExecuterService;
import org.springframework.stereotype.Component;

@Component
public class ServerScriptInjector {

    public ServerScriptInjector() {
        ScriptExecuterService.injectObject("_rabbit", new RabbitMock());
    }

}

