package edu.thss;

import edu.thss.platform.security.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ParameterBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.schema.ModelRef;
import springfox.documentation.service.Parameter;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableSwagger2
public class SwaggerConfig extends WebMvcAutoConfiguration {

    @Value("${admin.name}") private String adminName;
    @Value("${swagger.host.modeler}") private String swaggerHost;

    @Bean(value = "api")
    public Docket api() {
        ParameterBuilder ticketPar = new ParameterBuilder();
        List<Parameter> pars = new ArrayList<>();
//        天远Token
//        String token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IkE0MDc1MDAwRUNFMTVDRDZBMjY3N0M0QUJDNUMxNTMwRDYzRDRCREYiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJwQWRRQU96aFhOYWlaM3hLdkZ3Vk1OWTlTOTgifQ.eyJuYmYiOjE1MzI3Nzk5OTUsImV4cCI6MTUzNTM3MTk5NSwiaXNzIjoiaHR0cDovL3Rlc3Q0LnR5Z3BzLmNvbS90eW1pY3Mvb2F1dGgiLCJhdWQiOlsiaHR0cDovL3Rlc3Q0LnR5Z3BzLmNvbS90eW1pY3Mvb2F1dGgvcmVzb3VyY2VzIiwiYXBpIiwiY3NyYXBpIiwicmVudGFsYXBpIl0sImNsaWVudF9pZCI6InJlbnRhbHdlYiIsInN1YiI6IjEwMDAwMTIzODEiLCJhdXRoX3RpbWUiOjE1MzI3Nzk5OTUsImlkcCI6ImxvY2FsIiwiYWNudF9pZCI6IjEwMDAwMTIzODEiLCJncm91cF9pZCI6IiIsInN5c2lkIjoiMCIsIm9wcnRfbmFtZSI6IkRXRua1i-ivlSIsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJhcGkiLCJjc3JhcGkiLCJyZW50YWxhcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicGFzc3dvcmQiXX0.1p1_oA91sbLIVdQhQrrVeuUxa7wS4eWeDXoEE34NgBxBephwNqzEcJQ6aRMmOHrfcmcJotQR3JMllMHSAIYBMDaucR6JFzvP_lOjCgZkNNhI87JNjBSggxqbxkvPvY_x9Cww6vtvrMKpTA7zU7jAW2nGWs5m5gySopajcZL6uOBC8WMDcRWv74-j3jzcu8ngcDA_WYDp4LVHc05mv_OMMLE1r-pJrbwQEcjPeKBf0iBEqIdj4YBGaK7ZDq0wxCm1ehaxjMIx9X99oBgfxN5eA0aC3yaXOdldVuFp227KugyeTYIUrq7an17Ois_gvBzIh8mv5k5SPPk66OaJpLfILw";
        String token = JwtUtil.generateToken(adminName);
        ticketPar.name("Authorization")
                .description("JWT 身份验证token")
                .defaultValue(token) // "Bearer " +
                .modelRef(new ModelRef("string")).parameterType("header")
                .required(false).build(); // header中的ticket参数非必填，传空也可以
        pars.add(ticketPar.build());    // 根据每个方法名也知道当前方法在设置什么参数

        Docket docket = new Docket(DocumentationType.SWAGGER_2);
        if (swaggerHost != null && !swaggerHost.isEmpty()) docket.host(swaggerHost);

        return docket
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build()
                .globalOperationParameters(pars);
    }

}
