package com.hoatv.ext.endpoint;

import com.hoatv.ext.endpoint.dtos.DataGeneratorInfoVO;
import com.hoatv.ext.endpoint.dtos.EndpointResponseVO;
import com.hoatv.ext.endpoint.dtos.EndpointSettingOverviewVO;
import com.hoatv.ext.endpoint.dtos.EndpointSettingVO;
import com.hoatv.ext.endpoint.dtos.ExtTaskReportVO;
import com.hoatv.ext.endpoint.dtos.FilterVO;
import com.hoatv.ext.endpoint.dtos.InputVO;
import com.hoatv.ext.endpoint.dtos.MetadataVO;
import com.hoatv.ext.endpoint.dtos.OutputVO;
import com.hoatv.ext.endpoint.dtos.PatchEndpointSettingVO;
import com.hoatv.ext.endpoint.dtos.RequestInfoVO;
import com.hoatv.ext.endpoint.dtos.TableSearchVO;
import com.hoatv.ext.endpoint.models.EndpointExecutionResult;
import com.hoatv.ext.endpoint.models.EndpointResponse;
import com.hoatv.ext.endpoint.models.EndpointSetting;
import com.hoatv.ext.endpoint.models.StringMapConverter;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;

import java.util.HashMap;

public class ExternalEndpointRuntimeHints implements RuntimeHintsRegistrar {

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        registerReflection(hints,
                EndpointSetting.class,
                EndpointExecutionResult.class,
                EndpointResponse.class,
                StringMapConverter.class,
                EndpointSettingVO.class,
                EndpointSettingOverviewVO.class,
                EndpointResponseVO.class,
                ExtTaskReportVO.class,
                RequestInfoVO.class,
                DataGeneratorInfoVO.class,
                InputVO.class,
                FilterVO.class,
                OutputVO.class,
                MetadataVO.class,
                PatchEndpointSettingVO.class,
                TableSearchVO.class,
                HashMap.class);
    }

    private void registerReflection(RuntimeHints hints, Class<?>... types) {
        for (Class<?> type : types) {
            hints.reflection().registerType(type,
                    MemberCategory.INVOKE_DECLARED_CONSTRUCTORS,
                    MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                    MemberCategory.INVOKE_DECLARED_METHODS,
                    MemberCategory.INVOKE_PUBLIC_METHODS,
                    MemberCategory.DECLARED_FIELDS,
                    MemberCategory.PUBLIC_FIELDS);
        }
    }
}