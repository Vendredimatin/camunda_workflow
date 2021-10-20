package edu.thss.platform.example;

import java.util.Map;

/**
 * This is for a demo only
 */
public class RabbitMock {
    public String send(Map<String, Object> obj) { return "send message success. msg id: " + obj.get("oid"); }
    public String send() { return "send message success."; }
}
