package com.soccer.fut7.soccer_system.ValueObject;

import java.util.Optional;

public enum MatchPhase {
    ROUND_ROBIN("ROUND_ROBIN", "Round Robin"),
    JORNADA("JORNADA", "Jornada"), // New phase for regular matches
    OCTAVOS_PRIMERA("OCTAVOS_PRIMERA", "Octavos - Primera"),
    OCTAVOS_SEGUNDA("OCTAVOS_SEGUNDA", "Octavos - Segunda"),
    CUARTOS_PRIMERA("CUARTOS_PRIMERA", "Cuartos - Primera"),
    CUARTOS_SEGUNDA("CUARTOS_SEGUNDA", "Cuartos - Segunda"),
    SEMIFINAL_PRIMERA("SEMIFINAL_PRIMERA", "Semifinal - Primera"),
    SEMIFINAL_SEGUNDA("SEMIFINAL_SEGUNDA", "Semifinal - Segunda"),
    TERCER_LUGAR("TERCER_LUGAR", "Tercer Lugar"),
    FINAL_PRIMERA("FINAL_PRIMERA", "Final - Primera"),
    FINAL_SEGUNDA("FINAL_SEGUNDA", "Final - Segunda");

    private final String code;
    private final String description;

    MatchPhase(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

   

    public boolean isPrimera() {
        return this.code.endsWith("PRIMERA");
    }

    public boolean isSegunda() {
        return this.code.endsWith("SEGUNDA");
    }

    public boolean isKnockoutPhase() {
        return this.code.startsWith("OCTAVOS_") || 
               this.code.startsWith("CUARTOS_") || 
               this.code.startsWith("SEMIFINAL_") || 
               this.code.startsWith("FINAL_") || 
               this.code.equals("TERCER_LUGAR");
    }
    
    public boolean isJornada() {
        return this.code.equals("JORNADA");
    }



    
    public static MatchPhase fromCode(String code) {
        // Handle dynamic jornada numbers (e.g., "JORNADA1", "JORNADA18")
        if (code != null && code.startsWith("ROUND_ROBIN")) {
            return JORNADA;
        }
        
        for (MatchPhase phase : values()) {
            if (phase.code.equalsIgnoreCase(code)) {
                return phase;
            }
        }
        throw new IllegalArgumentException("Unknown phase code: " + code);
    }

    // Add this new method to extract jornada number
    public static Optional<Integer> getJornadaNumber(String phaseCode) {
        if (phaseCode != null && phaseCode.startsWith("JORNADA")) {
            try {
                String numberStr = phaseCode.substring("JORNADA".length());
                return Optional.of(Integer.parseInt(numberStr));
            } catch (NumberFormatException e) {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }
}