<?php
/**
 * Import Forma Luna Elementor JSON into real WordPress pages (Elementor document API).
 *
 * @package Formaluna_Luna
 */

if (! defined('ABSPATH')) {
    exit;
}

final class Formaluna_Luna_Elementor_Import
{
    private static ?self $instance = null;

    /** @var array<int, array{file: string, slug: string, title: string}> */
    private const PAGES = [
        [
            'file'  => 'b2c-about-us.json',
            'slug'  => 'studio-about',
            'title' => 'Studio — About',
        ],
        [
            'file'  => 'b2c-contact-us.json',
            'slug'  => 'studio-contact',
            'title' => 'Studio — Contact',
        ],
        [
            'file'  => 'b2c-product-detail.json',
            'slug'  => 'studio-product-detail',
            'title' => 'Studio — Product detail (template)',
        ],
        [
            'file'  => 'b2b-about-us-nova.json',
            'slug'  => 'trade-about',
            'title' => 'Trade — About',
        ],
        [
            'file'  => 'b2b-contact-us-nova.json',
            'slug'  => 'trade-contact',
            'title' => 'Trade — Contact',
        ],
        [
            'file'  => 'b2b-product-detail-nova.json',
            'slug'  => 'trade-product-detail',
            'title' => 'Trade — Product detail (template)',
        ],
    ];

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        add_action('admin_menu', [$this, 'register_menu']);
        add_action('admin_post_formaluna_import_elementor', [$this, 'handle_import']);
    }

    public function register_menu(): void
    {
        add_management_page(
            __('Forma Luna — Import pages', 'formaluna-luna'),
            __('Forma Luna Import', 'formaluna-luna'),
            'manage_options',
            'formaluna-luna-import',
            [$this, 'render_page']
        );
    }

    public function render_page(): void
    {
        if (! current_user_can('manage_options')) {
            return;
        }
        $notice = get_transient('formaluna_import_notice');
        if ($notice) {
            delete_transient('formaluna_import_notice');
            echo '<div class="notice notice-info is-dismissible"><p>' . esc_html($notice) . '</p></div>';
        }
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Forma Luna — Elementor pages', 'formaluna-luna'); ?></h1>
            <p><?php esc_html_e('Creates or updates six pages from bundled JSON (Studio + Trade). Run after Elementor is active. Product pages are layout templates — assign as WooCommerce templates or duplicate per SKU.', 'formaluna-luna'); ?></p>
            <ul style="list-style:disc;padding-left:1.5rem;">
                <?php foreach (self::PAGES as $row) : ?>
                    <li><code><?php echo esc_html($row['slug']); ?></code> — <?php echo esc_html($row['title']); ?></li>
                <?php endforeach; ?>
            </ul>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <?php wp_nonce_field('formaluna_import_elementor', 'formaluna_import_nonce'); ?>
                <input type="hidden" name="action" value="formaluna_import_elementor" />
                <?php submit_button(__('Import / update pages', 'formaluna-luna')); ?>
            </form>
        </div>
        <?php
    }

    public function handle_import(): void
    {
        if (! current_user_can('manage_options')) {
            wp_die(esc_html__('Forbidden.', 'formaluna-luna'));
        }
        check_admin_referer('formaluna_import_elementor', 'formaluna_import_nonce');

        if (! did_action('elementor/loaded')) {
            set_transient('formaluna_import_notice', __('Elementor is not active — cannot import.', 'formaluna-luna'), 60);
            wp_safe_redirect(wp_get_referer() ?: admin_url());
            exit;
        }

        $results = [];
        foreach (self::PAGES as $row) {
            $results[] = $this->import_one($row['file'], $row['slug'], $row['title']);
        }

        set_transient(
            'formaluna_import_notice',
            implode(' ', $results),
            120
        );
        wp_safe_redirect(admin_url('tools.php?page=formaluna-luna-import'));
        exit;
    }

    /**
     * @return string User-facing result line.
     */
    private function import_one(string $file, string $slug, string $title): string
    {
        $path = FORMALUNA_LUNA_PATH . 'assets/elementor-pages/' . $file;
        if (! is_readable($path)) {
            return sprintf(/* translators: %s file name */ __('Missing file %s. ', 'formaluna-luna'), $file);
        }

        $raw = file_get_contents($path);
        if ($raw === false) {
            return sprintf(__('Could not read %s. ', 'formaluna-luna'), $file);
        }

        $data = json_decode($raw, true);
        if (! is_array($data) || empty($data['content']) || ! is_array($data['content'])) {
            return sprintf(__('Invalid JSON in %s. ', 'formaluna-luna'), $file);
        }

        $settings = [];
        if (! empty($data['page_settings'][0]['settings']) && is_array($data['page_settings'][0]['settings'])) {
            $settings = $data['page_settings'][0]['settings'];
        }

        $post     = get_page_by_path($slug, OBJECT, 'page');
        $document = null;

        if ($post instanceof WP_Post) {
            update_post_meta($post->ID, '_elementor_edit_mode', 'builder');
            update_post_meta($post->ID, '_elementor_template_type', 'wp-page');
            if ($post->post_title !== $title) {
                wp_update_post([
                    'ID'         => $post->ID,
                    'post_title' => $title,
                ]);
            }
            $document = \Elementor\Plugin::$instance->documents->get($post->ID, false);
        }

        if (empty($document)) {
            $created = \Elementor\Plugin::$instance->documents->create(
                'wp-page',
                [
                    'post_title'  => $title,
                    'post_status' => 'publish',
                    'post_type'   => 'page',
                    'post_name'   => $slug,
                ],
                []
            );
            if (is_wp_error($created)) {
                return sprintf(__('Error creating %1$s: %2$s ', 'formaluna-luna'), esc_html($slug), esc_html($created->get_error_message()));
            }
            $document = $created;
        }

        $save = $document->save([
            'elements' => $data['content'],
            'settings' => $settings,
        ]);

        if (! $save) {
            return sprintf(__('Save failed for %s (check user caps / Elementor). ', 'formaluna-luna'), esc_html($slug));
        }

        return sprintf(__('OK: %1$s (ID %2$d). ', 'formaluna-luna'), esc_html($slug), (int) $document->get_main_id());
    }
}
