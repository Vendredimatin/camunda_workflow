//package edu.thss.platform.controller;
//
//import edu.thss.platform.utils.EnvironmentBuilder;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//import edu.thss.platform.service.AppExtService;
//
//@RestController
//@RequestMapping("dwf/v1/app-ext")
//public class AppExtController {
//
//    @Autowired
//    EnvironmentBuilder environmentBuilder;
//
//    @Autowired
//    AppExtService appExtService;
//
//    @GetMapping(path = "helloworld")
//    public ResponseMsg<String> listAllClasses(@RequestParam String name) {
//        return new ResponseMsg<>("Good evening, " + name + "!");
//    }
//
//    @GetMapping(path = "testWebSocket")
//    public ResponseMsg<String> testWebSocket() {
//        return new ResponseMsg<>(appExtService.testWebSocket(environmentBuilder.buildEnvironment()));
//    }
//}