<?php
/**
 * Plugin Name: Forma Luna — Site Tools
 * Description: Trade partner applications (admin approve/decline), Elementor page import for Forma Luna layouts, and helpers. Works with Elementor + WooCommerce.
 * Version: 1.0.0
 * Author: Forma Luna
 * Text Domain: formaluna-luna
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if (! defined('ABSPATH')) {
    exit;
}

define('FORMALUNA_LUNA_VERSION', '1.0.0');
define('FORMALUNA_LUNA_FILE', __FILE__);
define('FORMALUNA_LUNA_PATH', plugin_dir_path(__FILE__));
define('FORMALUNA_LUNA_URL', plugin_dir_url(__FILE__));

require_once FORMALUNA_LUNA_PATH . 'includes/class-elementor-import.php';
require_once FORMALUNA_LUNA_PATH . 'includes/class-partner-applications.php';

add_action('plugins_loaded', static function (): void {
    Formaluna_Luna_Elementor_Import::instance();
    Formaluna_Luna_Partner_Applications::instance();
});

register_activation_hook(__FILE__, static function (): void {
    Formaluna_Luna_Partner_Applications::on_activate();
});
