package com.taskapp.backend.config;

import ch.qos.logback.core.util.StringUtil;
import com.taskapp.backend.Utils.JwtUtil;
import com.taskapp.backend.services.jwt.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Check if the Authorization header is valid
        if (StringUtils.isEmpty(authHeader) || !StringUtils.startsWith(authHeader, "Bearer")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the JWT token and username from it
        jwt = authHeader.substring(7);
        userEmail = jwtUtil.extractUserName(jwt);

        // Proceed if userEmail is valid and no authentication is set in context
        if (!StringUtils.isEmpty(userEmail) && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userService.userDetailService().loadUserByUsername(userEmail);

            // Validate the token
            if (jwtUtil.isTokenValid(jwt, userDetails)) {
                // Log for debugging purposes
                logger.info("JWT token is valid for user: {}", userEmail);

                // Create an empty security context
                SecurityContext context = SecurityContextHolder.createEmptyContext();

                // Extract the role from the JWT and map it to authorities
                String role = (String) jwtUtil.extractAllClaims(jwt).get("role");
                var authorities = (role != null)
                        ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        : Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));  // Default if role is missing

                // Create an authentication token and set it in the context
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                context.setAuthentication(authToken);
                SecurityContextHolder.setContext(context);

                // Log successful authentication
                logger.info("Authentication successful for user: {}", userEmail);
            }
        }

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }
}
