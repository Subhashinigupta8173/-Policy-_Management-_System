package com.insurex.policy.config;

import com.insurex.policy.enums.ClaimEvent;
import com.insurex.policy.enums.ClaimStatus;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.StateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory
public class StateMachineConfig extends StateMachineConfigurerAdapter<ClaimStatus, ClaimEvent> {

    @Override
    public void configure(StateMachineStateConfigurer<ClaimStatus, ClaimEvent> states) throws Exception {
        states.withStates()
                .initial(ClaimStatus.SUBMITTED)
                .states(EnumSet.allOf(ClaimStatus.class))
                .end(ClaimStatus.REJECTED)
                .end(ClaimStatus.DISBURSED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<ClaimStatus, ClaimEvent> transitions) throws Exception {
        transitions
                .withExternal()
                    .source(ClaimStatus.SUBMITTED).target(ClaimStatus.UNDER_REVIEW)
                    .event(ClaimEvent.START_REVIEW)
                .and()
                .withExternal()
                    .source(ClaimStatus.UNDER_REVIEW).target(ClaimStatus.APPROVED)
                    .event(ClaimEvent.APPROVE)
                .and()
                .withExternal()
                    .source(ClaimStatus.UNDER_REVIEW).target(ClaimStatus.REJECTED)
                    .event(ClaimEvent.REJECT)
                .and()
                .withExternal()
                    .source(ClaimStatus.APPROVED).target(ClaimStatus.DISBURSED)
                    .event(ClaimEvent.DISBURSE);
    }
}
