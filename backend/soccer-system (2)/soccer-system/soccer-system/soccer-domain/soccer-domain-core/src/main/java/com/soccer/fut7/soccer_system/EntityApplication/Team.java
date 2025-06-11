package com.soccer.fut7.soccer_system.EntityApplication;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.*;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Team extends AggregateRoot {
    private UUID id;
    private TeamName name;
    private TeamLogo logo;
    private Category category;
    private int numberOfPlayers;
    private TeamStats stats;
    private Boolean active;
    private Set<Player> players;



    
}

/*
 * dtos
 * User register (with all atributes addreses,etc) commandWriter
 * User login (user,paswword,role) commandWriter and commandResponse
 * User with all information with all its information
 * User with the role of the referee, other with the role of the administrator,
 * with the role of the user here also i show the (user and role)
 * Team to get with all its information (without all palyers AND other with all
 * players(also with all information about the players, name,numberJeysey,) ,
 * Team with commandHandler to resgister a new team with all its information and
 * also with all employes(the way most efficient POSSIBLE (in this first i need
 * register the team, after will fillin' the array of employees and the final
 * will register the employes this is a manner my is there is a better that can
 * convert more faster my code better)
 * a dto to insert the information about a match that just played but i need
 * register all stats about this match (Here i need to affect the resultAbout
 * the team, and the playerMatchs, see you can work with this entities or i
 * neeed modify it), within this transaction also i need to affect the entities
 * players and match ( the points, goals (both) to follow the starts in
 * realTime)
 * Also a to get the information about the matchStats the same ways all
 * information the players and match stasts)
 * A dto to get all the categories other to register a new category
 * A dtp tp get all teams that belong to the one category (a with only number
 * about the teams, and only where i see all teams teams information (only the
 * name, goals and points))
 * Team to get all players in the team ( number of the players), thus ya try to
 * make this action the most fastest possible with the best practice,
 * To insert a new referee
 * A dto that orginize the teams with the most points ( in this dtop will have a
 * nameTeam, goals( both) and points
 * A dtio that orginize the player with the most poinst ( in this dto will have
 * the nameEmploye,goal(both) and points)
 * A dtop to register a new player only with the name because the
 * debt,matchStast,goals and points will be empty becasue is a new player
 * A dto to get the certain with all its informaiton (
 * name,age,dateBirth,goals(both),points)
 * Team with only the attribute or attributes that i wanna change ( the way most
 * efficient to avoid create several methods to change a specific thin')
 * player with only the attribute or attributes that i wanna change ( the way
 * most efficient to avoid create several methods to change a specific thin')
 * Category info (name and ageRange)
 * To insert a new paymentRefere with all data necessary
 * To get the the information about the paymentReferee
 * To insert a debtPlayer with all information possible
 * To insert a debTtEAM with all information possible
 * to get the debtPlayer with all information possible
 * to gte the debtTeam with sll iinformation possible
 * 
 * 
 * From those dtos i wanna create the action in the application-folder that will
 * get these dtos and convert them to entities of the domain, these entities of
 * domain will be send them to the repository(that implemet the outports) that
 * accept these entities domain, these i make like this because the project will
 * be splitted in 3 layers, the first will be the applicationclient that send
 * these entities or commandHandlers ( Dtos) to the application domain,after the
 * application domain use tha mapper to pass them to these entities domain using
 * mapper ( inclusive here i wanna a library external to mapped these entities,
 * during these method that will handle all the validation apart of the
 * entities, joini the object and entities and after send them to the entities
 * that will recive these repository( that will mapped to entitiesRepository to
 * hit the database in this potsgrest) these repository will be implemtin' the
 * putports and make the certain actions to get the goal, BUT NOW ONLY I WANNA
 * YOU MAKE THE APPLICATION ACTION TO UP-LEVEL WITHOUT IMPLEMENTATION OF THE
 * REPOSITORY OR CLIENT
 */