<?php

/**
 * Child Theme Function
 *
 */

add_action( 'after_setup_theme', 'ciri_child_theme_setup' );
add_action( 'wp_enqueue_scripts', 'ciri_child_enqueue_styles', 100);

if( !function_exists('ciri_child_enqueue_styles') ) {
    function ciri_child_enqueue_styles() {
        $version = wp_get_theme()->get('Version');
        wp_enqueue_style( 'ciri-child-style', get_stylesheet_directory_uri() . '/style.css', null, $version );
        wp_enqueue_style(
            'formaluna-brand',
            get_stylesheet_directory_uri() . '/assets/css/formaluna-brand.css',
            array( 'ciri-child-style' ),
            $version
        );
    }
}


if( !function_exists('ciri_child_theme_setup') ) {
    function ciri_child_theme_setup() {
        load_child_theme_textdomain( 'ciri-child', get_stylesheet_directory() . '/languages' );
    }
}