<?php
/**
 * B2B trade partner applications — admin approve / decline, optional WordPress user on approve.
 *
 * @package Formaluna_Luna
 */

if (! defined('ABSPATH')) {
    exit;
}

final class Formaluna_Luna_Partner_Applications
{
    public const CPT = 'fl_partner_app';

    public const META_STATUS = '_fl_status';

    public const META_COMPANY = '_fl_company';

    public const META_CONTACT = '_fl_contact_name';

    public const META_EMAIL = '_fl_email';

    public const META_PHONE = '_fl_phone';

    public const META_VAT = '_fl_vat';

    public const META_NOTES = '_fl_notes';

    public const ROLE = 'fl_trade_partner';

    private static ?self $instance = null;

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public static function on_activate(): void
    {
        self::register_cpt();
        self::register_role();
        flush_rewrite_rules();
    }

    private function __construct()
    {
        add_action('init', [$this, 'register_cpt']);
        add_action('init', [$this, 'register_role']);
        add_shortcode('formaluna_partner_register', [$this, 'shortcode_register_form']);

        add_filter('manage_' . self::CPT . '_posts_columns', [$this, 'columns']);
        add_action('manage_' . self::CPT . '_posts_custom_column', [$this, 'column_content'], 10, 2);

        add_action('admin_post_formaluna_partner_approve', [$this, 'handle_approve']);
        add_action('admin_post_formaluna_partner_decline', [$this, 'handle_decline']);
        add_action('admin_post_nopriv_formaluna_partner_apply', [$this, 'handle_public_apply']);
        add_action('admin_post_formaluna_partner_apply', [$this, 'handle_public_apply']);

        add_action('wp_enqueue_scripts', [$this, 'enqueue_form_styles']);
    }

    public static function register_cpt(): void
    {
        register_post_type(
            self::CPT,
            [
                'labels'              => [
                    'name'          => __('Partner applications', 'formaluna-luna'),
                    'singular_name' => __('Partner application', 'formaluna-luna'),
                    'add_new_item'  => __('Add application', 'formaluna-luna'),
                    'edit_item'     => __('Edit application', 'formaluna-luna'),
                ],
                'public'              => false,
                'show_ui'             => true,
                'show_in_menu'        => true,
                'menu_icon'           => 'dashicons-groups',
                'capability_type'     => 'post',
                'map_meta_cap'        => true,
                'supports'            => ['title'],
                'show_in_rest'        => false,
                'exclude_from_search' => true,
            ]
        );
    }

    public static function register_role(): void
    {
        if (get_role(self::ROLE)) {
            return;
        }
        $base = get_role('customer');
        $caps = $base && is_array($base->capabilities) ? $base->capabilities : ['read' => true];
        add_role(self::ROLE, __('Trade Partner', 'formaluna-luna'), $caps);
    }

    public function enqueue_form_styles(): void
    {
        if (! is_singular()) {
            return;
        }
        global $post;
        if (! $post instanceof WP_Post || ! has_shortcode($post->post_content, 'formaluna_partner_register')) {
            return;
        }
        wp_register_style('formaluna-partner-form', false);
        wp_enqueue_style('formaluna-partner-form');
        $css = '
        .fl-partner-form{max-width:520px;font-family:Arial,Helvetica,sans-serif;color:#4b604c;}
        .fl-partner-form label{display:block;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;margin:16px 0 6px;opacity:0.75;}
        .fl-partner-form input[type=text],.fl-partner-form input[type=email],.fl-partner-form input[type=tel],.fl-partner-form textarea{width:100%;padding:12px 14px;border:1px solid rgba(75,96,76,0.35);background:#fff;box-sizing:border-box;}
        .fl-partner-form textarea{min-height:100px;resize:vertical;}
        .fl-partner-form .fl-row{margin-top:20px;}
        .fl-partner-form button,.fl-partner-form input[type=submit]{background:#4b604c;color:#fff;border:none;padding:14px 28px;cursor:pointer;font-size:1rem;}
        .fl-partner-form button:hover,.fl-partner-form input[type=submit]:hover{background:#3d4c3d;}
        .fl-partner-form .fl-msg{padding:12px;margin-bottom:16px;border:1px solid rgba(75,96,76,0.35);}
        .fl-partner-form .fl-msg.ok{background:rgba(75,96,76,0.08);}
        .fl-partner-form .fl-msg.err{background:#fff5f5;border-color:#d63638;}
        .fl-partner-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;}
        ';
        wp_add_inline_style('formaluna-partner-form', $css);
    }

    /**
     * @param string[] $cols
     * @return string[]
     */
    public function columns(array $cols): array
    {
        $cols['title']      = __('Company', 'formaluna-luna');
        $cols['fl_contact'] = __('Contact', 'formaluna-luna');
        $cols['fl_email']   = __('Email', 'formaluna-luna');
        $cols['fl_status']  = __('Status', 'formaluna-luna');
        $cols['fl_actions'] = __('Actions', 'formaluna-luna');
        return $cols;
    }

    public function column_content(string $column, int $post_id): void
    {
        if ($column === 'fl_contact') {
            echo esc_html((string) get_post_meta($post_id, self::META_CONTACT, true));
            return;
        }
        if ($column === 'fl_email') {
            echo esc_html((string) get_post_meta($post_id, self::META_EMAIL, true));
            return;
        }
        if ($column === 'fl_status') {
            $st = (string) get_post_meta($post_id, self::META_STATUS, true);
            echo esc_html($st !== '' ? $st : 'pending');
            return;
        }
        if ($column === 'fl_actions') {
            $st = (string) get_post_meta($post_id, self::META_STATUS, true);
            if ($st === 'approved' || $st === 'declined') {
                esc_html_e('—', 'formaluna-luna');
                return;
            }
            $ap = wp_nonce_url(
                admin_url('admin-post.php?action=formaluna_partner_approve&post_id=' . $post_id),
                'formaluna_partner_' . $post_id,
                'formaluna_nonce'
            );
            $de = wp_nonce_url(
                admin_url('admin-post.php?action=formaluna_partner_decline&post_id=' . $post_id),
                'formaluna_partner_' . $post_id,
                'formaluna_nonce'
            );
            echo '<a class="button button-small button-primary" href="' . esc_url($ap) . '">' . esc_html__('Approve', 'formaluna-luna') . '</a> ';
            echo '<a class="button button-small" href="' . esc_url($de) . '">' . esc_html__('Decline', 'formaluna-luna') . '</a>';
        }
    }

    public function handle_approve(): void
    {
        $this->assert_admin_partner_action();
        $post_id = isset($_GET['post_id']) ? (int) $_GET['post_id'] : 0;
        $post = get_post($post_id);
        if (! $post || $post->post_type !== self::CPT) {
            wp_die(esc_html__('Invalid application.', 'formaluna-luna'));
        }

        $email = sanitize_email((string) get_post_meta($post_id, self::META_EMAIL, true));
        if (! is_email($email)) {
            wp_die(esc_html__('Application has no valid email.', 'formaluna-luna'));
        }

        $user = get_user_by('email', $email);
        if ($user) {
            $user->set_role(self::ROLE);
        } else {
            $login = sanitize_user(sanitize_title(explode('@', $email)[0] ?? 'partner'), true);
            if (username_exists($login)) {
                $login .= wp_rand(100, 999);
            }
            $pass = wp_generate_password(20);
            $uid  = wp_create_user($login, $pass, $email);
            if (is_wp_error($uid)) {
                wp_die(esc_html($uid->get_error_message()));
            }
            $user = get_user_by('id', $uid);
            if ($user) {
                $user->set_role(self::ROLE);
            }
            if (function_exists('wp_send_new_user_notifications')) {
                wp_send_new_user_notifications($uid, 'both');
            } else {
                wp_new_user_notification($uid, null, 'both');
            }
        }

        update_post_meta($post_id, self::META_STATUS, 'approved');

        wp_mail(
            $email,
            __('Your trade partner application was approved', 'formaluna-luna'),
            __("Hello,\n\nYour Forma Luna trade partner application has been approved. You can log in at:\n", 'formaluna-luna') . wp_login_url() . "\n\n" . __('— Forma Luna', 'formaluna-luna'),
            ['Content-Type: text/plain; charset=UTF-8']
        );

        wp_safe_redirect(admin_url('edit.php?post_type=' . self::CPT . '&formaluna=approved'));
        exit;
    }

    public function handle_decline(): void
    {
        $this->assert_admin_partner_action();
        $post_id = isset($_GET['post_id']) ? (int) $_GET['post_id'] : 0;
        $post = get_post($post_id);
        if (! $post || $post->post_type !== self::CPT) {
            wp_die(esc_html__('Invalid application.', 'formaluna-luna'));
        }

        update_post_meta($post_id, self::META_STATUS, 'declined');

        $email = sanitize_email((string) get_post_meta($post_id, self::META_EMAIL, true));
        if (is_email($email)) {
            wp_mail(
                $email,
                __('Update on your trade partner application', 'formaluna-luna'),
                __("Hello,\n\nThank you for your interest. We are unable to approve this partner application at this time.\n\n", 'formaluna-luna') . __('— Forma Luna', 'formaluna-luna'),
                ['Content-Type: text/plain; charset=UTF-8']
            );
        }

        wp_safe_redirect(admin_url('edit.php?post_type=' . self::CPT . '&formaluna=declined'));
        exit;
    }

    private function assert_admin_partner_action(): void
    {
        if (! current_user_can('manage_options')) {
            wp_die(esc_html__('Forbidden.', 'formaluna-luna'));
        }
        $post_id = isset($_GET['post_id']) ? (int) $_GET['post_id'] : 0;
        check_admin_referer('formaluna_partner_' . $post_id, 'formaluna_nonce');
    }

    public function handle_public_apply(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            wp_safe_redirect(home_url('/'));
            exit;
        }

        check_admin_referer('formaluna_partner_apply', 'formaluna_partner_nonce');

        if (! empty($_POST['fl_website'])) {
            wp_safe_redirect(wp_get_referer() ?: home_url('/'));
            exit;
        }

        $company = sanitize_text_field(wp_unslash($_POST['fl_company'] ?? ''));
        $contact = sanitize_text_field(wp_unslash($_POST['fl_contact'] ?? ''));
        $email   = sanitize_email(wp_unslash($_POST['fl_email'] ?? ''));
        $phone   = sanitize_text_field(wp_unslash($_POST['fl_phone'] ?? ''));
        $vat     = sanitize_text_field(wp_unslash($_POST['fl_vat'] ?? ''));
        $notes   = sanitize_textarea_field(wp_unslash($_POST['fl_notes'] ?? ''));

        $redirect = esc_url_raw(wp_unslash($_POST['_wp_http_referer'] ?? home_url('/')));

        if ($company === '' || $contact === '' || ! is_email($email) || $vat === '') {
            wp_safe_redirect(add_query_arg('fl_partner', 'invalid', $redirect));
            exit;
        }

        $dup = new WP_Query([
            'post_type'      => self::CPT,
            'post_status'    => 'any',
            'posts_per_page' => 1,
            'fields'         => 'ids',
            'meta_query'     => [
                [
                    'key'   => self::META_EMAIL,
                    'value' => $email,
                ],
            ],
        ]);
        if ($dup->have_posts()) {
            wp_safe_redirect(add_query_arg('fl_partner', 'duplicate', $redirect));
            exit;
        }

        $post_id = wp_insert_post(
            [
                'post_type'   => self::CPT,
                'post_status' => 'publish',
                'post_title'  => $company,
            ],
            true
        );

        if (is_wp_error($post_id)) {
            wp_safe_redirect(add_query_arg('fl_partner', 'error', $redirect));
            exit;
        }

        update_post_meta($post_id, self::META_STATUS, 'pending');
        update_post_meta($post_id, self::META_COMPANY, $company);
        update_post_meta($post_id, self::META_CONTACT, $contact);
        update_post_meta($post_id, self::META_EMAIL, $email);
        update_post_meta($post_id, self::META_PHONE, $phone);
        update_post_meta($post_id, self::META_VAT, $vat);
        update_post_meta($post_id, self::META_NOTES, $notes);

        $admin = get_option('admin_email');
        wp_mail(
            $admin,
            sprintf(/* translators: %s company */ __('New trade partner application: %s', 'formaluna-luna'), $company),
            "Company: {$company}\nContact: {$contact}\nEmail: {$email}\nPhone: {$phone}\nVAT: {$vat}\n\n{$notes}\n\n" . admin_url('post.php?post=' . (int) $post_id . '&action=edit'),
            ['Content-Type: text/plain; charset=UTF-8']
        );

        wp_safe_redirect(add_query_arg('fl_partner', 'thanks', $redirect));
        exit;
    }

    public function shortcode_register_form(): string
    {
        $msg = '';
        if (isset($_GET['fl_partner'])) {
            $code = sanitize_key(wp_unslash($_GET['fl_partner']));
            $map  = [
                'thanks'    => ['ok', __('Thank you. We will review your application.', 'formaluna-luna')],
                'invalid'   => ['err', __('Please fill all required fields with a valid email.', 'formaluna-luna')],
                'duplicate' => ['err', __('An application with this email already exists.', 'formaluna-luna')],
                'error'     => ['err', __('Something went wrong. Please try again later.', 'formaluna-luna')],
            ];
            if (isset($map[$code])) {
                $msg = '<div class="fl-msg ' . esc_attr($map[$code][0]) . '">' . esc_html($map[$code][1]) . '</div>';
            }
        }

        $action = esc_url(admin_url('admin-post.php'));
        ob_start();
        ?>
        <div class="fl-partner-form">
            <?php echo $msg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above ?>
            <form method="post" action="<?php echo esc_url($action); ?>">
                <input type="hidden" name="action" value="formaluna_partner_apply" />
                <?php wp_nonce_field('formaluna_partner_apply', 'formaluna_partner_nonce'); ?>
                <input type="hidden" name="_wp_http_referer" value="<?php echo esc_url(get_permalink() ?: home_url('/')); ?>" />
                <p class="fl-partner-hp">
                    <label><?php esc_html_e('Leave blank', 'formaluna-luna'); ?>
                        <input type="text" name="fl_website" value="" tabindex="-1" autocomplete="off" />
                    </label>
                </p>
                <label for="fl_company"><?php esc_html_e('Company name', 'formaluna-luna'); ?> *</label>
                <input type="text" id="fl_company" name="fl_company" required maxlength="200" />

                <label for="fl_contact"><?php esc_html_e('Contact person', 'formaluna-luna'); ?> *</label>
                <input type="text" id="fl_contact" name="fl_contact" required maxlength="200" />

                <label for="fl_email"><?php esc_html_e('Professional email', 'formaluna-luna'); ?> *</label>
                <input type="email" id="fl_email" name="fl_email" required maxlength="200" />

                <label for="fl_phone"><?php esc_html_e('Phone', 'formaluna-luna'); ?></label>
                <input type="tel" id="fl_phone" name="fl_phone" maxlength="80" />

                <label for="fl_vat"><?php esc_html_e('VAT number', 'formaluna-luna'); ?> *</label>
                <input type="text" id="fl_vat" name="fl_vat" required maxlength="80" />

                <label for="fl_notes"><?php esc_html_e('Notes (optional)', 'formaluna-luna'); ?></label>
                <textarea id="fl_notes" name="fl_notes" maxlength="4000"></textarea>

                <div class="fl-row">
                    <input type="submit" value="<?php esc_attr_e('Request trade access', 'formaluna-luna'); ?>" />
                </div>
            </form>
        </div>
        <?php
        return (string) ob_get_clean();
    }
}
