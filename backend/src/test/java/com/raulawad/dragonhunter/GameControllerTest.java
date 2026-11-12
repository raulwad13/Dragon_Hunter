package com.raulawad.dragonhunter;

import org.junit.jupiter.api.Test;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class GameControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @Test
    void createsNewGameWithStartingStats() throws Exception {
        mvc.perform(post("/api/games"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.screen").value("TOWN"))
            .andExpect(jsonPath("$.health").value(100))
            .andExpect(jsonPath("$.gold").value(50))
            .andExpect(jsonPath("$.weapon").value("stick"));
    }

    @Test
    void rejectsUnknownGameSession() throws Exception {
        mvc.perform(get("/api/games/00000000-0000-0000-0000-000000000001"))
            .andExpect(status().isNotFound());
    }

    @Test
    void validatesActionPayload() throws Exception {
        String response = mvc.perform(post("/api/games"))
            .andReturn().getResponse().getContentAsString();
        String id = mapper.readTree(response).get("id").asText();
        mvc.perform(post("/api/games/" + id + "/actions")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"action\":\"\"}"))
            .andExpect(status().isBadRequest());
    }
    @Test
    void cannotBuyItemsOutsideStore() throws Exception {
        String response = mvc.perform(post("/api/games"))
            .andReturn().getResponse().getContentAsString();
        String id = mapper.readTree(response).get("id").asText();

        mvc.perform(post("/api/games/" + id + "/actions")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"action\":\"BUY_WEAPON\"}"))
            .andExpect(status().isConflict());
    }

    @Test
    void canVisitStoreAndBuyWeapon() throws Exception {
        String response = mvc.perform(post("/api/games"))
            .andReturn().getResponse().getContentAsString();
        String id = mapper.readTree(response).get("id").asText();

        mvc.perform(post("/api/games/" + id + "/actions")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"action\":\"GO_STORE\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.screen").value("STORE"));

        mvc.perform(post("/api/games/" + id + "/actions")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"action\":\"BUY_WEAPON\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.gold").value(20))
            .andExpect(jsonPath("$.weapon").value("dagger"));
    }

}
