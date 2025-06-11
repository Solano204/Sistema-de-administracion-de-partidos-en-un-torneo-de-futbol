package com.soccer.fut7.soccer_system.main;

import java.util.Locale.Category;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.soccer.fut7.soccer_system.EntityApplication.Debt;
import com.soccer.fut7.soccer_system.ports.input.service.CategoryApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.DebtPlayerApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.DebtTeamApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.MatchApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.PlayerApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.RefereeApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.RefereePaymentApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.TeamApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.UserApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.CategoryApplicationServiceImpl;
import com.soccer.fut7.soccer_system.serviceImpls.DebtPlayerApplicationServiceImpl;
import com.soccer.fut7.soccer_system.serviceImpls.DebtTeamApplicationServiceImpl;
import com.soccer.fut7.soccer_system.serviceImpls.MatchApplicationServiceImpl;
import com.soccer.fut7.soccer_system.serviceImpls.PlayerApplicationServiceImpl;
import com.soccer.fut7.soccer_system.serviceImpls.RefereeApplicationServiceImpl;
import com.soccer.fut7.soccer_system.serviceImpls.TeamApplicationServiceImp;

// @Configuration
// public class BeanConfiguration {

//     // @Bean
//     // public TeamApplicationService teamApplicationService() {
//     //     return new TeamApplicationServiceImp(null);
//     // }

//     // @Bean
//     // public  CategoryApplicationService categoryApplicationService() {
//     //     return new CategoryApplicationServiceImpl();
//     // }


//     // @Bean
//     // public DebtTeamApplicationService debtApplicationService() {
//     //     return new DebtTeamApplicationServiceImpl();
//     // }

//     // @Bean
//     // public DebtPlayerApplicationService debtPlayerApplicationService() {
//     //     return new DebtPlayerApplicationServiceImpl();
//     // }


//     // @Bean
//     // public MatchApplicationService matchApplicationService() {
//     //     return new MatchApplicationServiceImpl();
//     // }


//     // @Bean
//     // public PlayerApplicationService playerApplicationService() {
//     //     return new PlayerApplicationServiceImpl();
//     // }

//     // @Bean
//     // public RefereeApplicationService refereeApplicationService() {
//     //     return new RefereeApplicationServiceImpl();
//     // }


//     // @Bean
//     // public RefereePaymentApplicationService refereePaymentApplicationService() {
//     //     return new RefereePaymentApplicationServiceImpl();
//     // }

//     // @Bean
//     // public UserApplicationService userApplicationService() {
//     //     return new UserApplicationServiceImpl();
//     // }
// }
