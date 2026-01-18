/// LinkTree Profile Module
/// 
/// This module implements on-chain LinkTree profiles on Sui.
/// Users can create profiles with links, bio, avatar, and theme settings.
/// Supports dynamic field name → object_id mapping for easy lookup.

module sealink::linktree 
{
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_field;
    use sui::event;
    use sui::transfer;

    /// Link item: label and URL
    public struct Link has store, copy, drop {
        label: String,
        url: String,
    }

    /// LinkTree Profile object
    public struct LinkTreeProfile has key, store {
        id: UID,
        owner: address,
        username: String,
        bio: String,
        avatar_cid: String,
        walrus_blob_id: String,
        links: vector<Link>,
        theme: String,
        created_at: u64,
        updated_at: u64,
    }

    /// Admin capability to manage global registry
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Global registry for name → profile mapping
    public struct Registry has key {
        id: UID,
    }

    // ===== Events =====

    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        owner: address,
        username: String,
    }

    public struct ProfileUpdated has copy, drop {
        profile_id: ID,
        owner: address,
        updated_at: u64,
    }

    public struct LinkAdded has copy, drop {
        profile_id: ID,
        label: String,
        url: String,
    }

    public struct LinkRemoved has copy, drop {
        profile_id: ID,
        label: String,
    }

    // ===== Errors =====

    const ENotOwner: u64 = 1;
    const EInvalidUsername: u64 = 2;
    const ELinkNotFound: u64 = 3;
    const EUsernameAlreadyTaken: u64 = 4;

    // ===== Init =====

    /// Initialize the module with a registry and admin capability
    fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx),
        };
        transfer::share_object(registry);

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ===== Public Functions =====

    /// Create a new LinkTree profile
    public fun create_profile(
        registry: &mut Registry,
        username: String,
        bio: String,
        avatar_cid: String,
        theme: String,
        walrus_blob_id: String,
        ctx: &mut TxContext,
    ): LinkTreeProfile {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        // Check if username is already taken
        let name_field_key = string::to_ascii(username);
        assert!(
            !dynamic_field::exists_with_type<String, ID>(&registry.id, name_field_key),
            EUsernameAlreadyTaken
        );

        let profile = LinkTreeProfile {
            id: object::new(ctx),
            owner: sender,
            username: username,
            bio,
            avatar_cid,
            walrus_blob_id: walrus_blob_id,
            links: vector::empty(),
            theme,
            created_at: timestamp,
            updated_at: timestamp,
        };

        // Register username in dynamic field
        let profile_id = object::id(&profile);
        dynamic_field::add(
            &mut registry.id,
            name_field_key,
            profile_id,
        );

        event::emit(ProfileCreated {
            profile_id,
            owner: sender,
            username,
        });

        profile
    }

    /// Add a link to the profile
    public fun add_link(
        profile: &mut LinkTreeProfile,
        label: String,
        url: String,
        ctx: &mut TxContext,
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotOwner);

        let link = Link { label: label, url: url };
        vector::push_back(&mut profile.links, link);
        profile.updated_at = tx_context::epoch(ctx);

        event::emit(LinkAdded {
            profile_id: object::id(profile),
            label,
            url,
        });
    }

    /// Remove a link from the profile by label
    public fun remove_link(
        profile: &mut LinkTreeProfile,
        label: String,
        ctx: &mut TxContext,
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotOwner);

        let (found, index) = find_link_index(&profile.links, &label);
        assert!(found, ELinkNotFound);

        vector::remove(&mut profile.links, index);
        profile.updated_at = tx_context::epoch(ctx);

        event::emit(LinkRemoved {
            profile_id: object::id(profile),
            label,
        });
    }

    /// Update the profile bio
    public fun update_bio(
        profile: &mut LinkTreeProfile,
        new_bio: String,
        ctx: &mut TxContext,
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotOwner);
        profile.bio = new_bio;
        profile.updated_at = tx_context::epoch(ctx);

        event::emit(ProfileUpdated {
            profile_id: object::id(profile),
            owner: profile.owner,
            updated_at: profile.updated_at,
        });
    }

    /// Update the profile avatar
    public fun update_avatar(
        profile: &mut LinkTreeProfile,
        new_avatar_cid: String,
        ctx: &mut TxContext,
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotOwner);
        profile.avatar_cid = new_avatar_cid;
        profile.updated_at = tx_context::epoch(ctx);

        event::emit(ProfileUpdated {
            profile_id: object::id(profile),
            owner: profile.owner,
            updated_at: profile.updated_at,
        });
    }

    /// Update the profile theme
    public fun update_theme(
        profile: &mut LinkTreeProfile,
        new_theme: String,
        ctx: &mut TxContext,
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotOwner);
        profile.theme = new_theme;
        profile.updated_at = tx_context::epoch(ctx);

        event::emit(ProfileUpdated {
            profile_id: object::id(profile),
            owner: profile.owner,
            updated_at: profile.updated_at,
        });
    }

    /// Get profile ID from username (lookup by dynamic field)
    public fun get_profile_id_by_username(
        registry: &Registry,
        username: String,
    ): Option<ID> {
        let name_field_key = string::to_ascii(username);
        if (dynamic_field::exists_with_type<String, ID>(&registry.id, name_field_key)) {
            let profile_id = dynamic_field::borrow<String, ID>(&registry.id, name_field_key);
            option::some(*profile_id)
        } else {
            option::none()
        }
    }

    // ===== View Functions =====

    public fun get_owner(profile: &LinkTreeProfile): address {
        profile.owner
    }

    public fun get_username(profile: &LinkTreeProfile): String {
        profile.username
    }

    public fun get_bio(profile: &LinkTreeProfile): String {
        profile.bio
    }

    public fun get_avatar_cid(profile: &LinkTreeProfile): String {
        profile.avatar_cid
    }

    public fun get_links(profile: &LinkTreeProfile): &vector<Link> {
        &profile.links
    }

    public fun get_theme(profile: &LinkTreeProfile): String {
        profile.theme
    }

    public fun get_created_at(profile: &LinkTreeProfile): u64 {
        profile.created_at
    }

    public fun get_updated_at(profile: &LinkTreeProfile): u64 {
        profile.updated_at
    }

    public fun link_label(link: &Link): String {
        link.label
    }

    public fun link_url(link: &Link): String {
        link.url
    }

    // ===== Seal Messaging (Using Walrus Seal Blob Storage) =====

    /// Anonymous message with Seal Blob reference
    /// Message content is stored in Walrus Seal Blob Storage
    public struct SealedMessage has key, store {
        id: UID,
        profile_id: ID,
        sender_hash: String,      // Hashed sender identity (anonymous or name hash)
        seal_blob_id: String,     // Walrus Seal Blob ID (reference to encrypted message)
        is_anonymous: bool,
        sender_name: String,       // Empty if anonymous
        created_at: u64,
    }

    /// Message box for storing sealed message references
    /// Only stores IDs and blob references, actual content is in Seal Storage
    public struct MessageBox has key {
        id: UID,
        profile_id: ID,
        message_refs: vector<ID>,  // IDs of SealedMessage objects in Seal Storage
        message_count: u64,
    }

    // ===== Seal Messaging Events =====

    public struct SealedMessageSent has copy, drop {
        profile_id: ID,
        message_id: ID,
        seal_blob_id: String,     // Blob ID for off-chain retrieval
        sender_hash: String,
        is_anonymous: bool,
        created_at: u64,
    }

    // ===== Seal Messaging Functions =====

    /// Create a message box for a profile
    /// Called once per profile to initialize messaging
    public fun create_message_box(
        profile: &LinkTreeProfile,
        ctx: &mut TxContext,
    ): MessageBox {
        MessageBox {
            id: object::new(ctx),
            profile_id: object::id(profile),
            message_refs: vector::empty(),
            message_count: 0,
        }
    }

    /// Send an anonymous sealed message via Walrus Seal
    /// The actual message content is stored in Seal Blob Storage
    /// This function records the reference to the blob
    public fun send_sealed_message(
        message_box: &mut MessageBox,
        seal_blob_id: String,      // ID from Walrus Seal blob upload
        sender_hash: String,        // Hash of sender identity
        is_anonymous: bool,
        sender_name: String,        // Name (empty if anonymous)
        ctx: &mut TxContext,
    ): SealedMessage {
        let timestamp = tx_context::epoch(ctx);
        let profile_id = message_box.profile_id;
        
        let sealed_msg = SealedMessage {
            id: object::new(ctx),
            profile_id,
            sender_hash: sender_hash,
            seal_blob_id: seal_blob_id,
            is_anonymous,
            sender_name,
            created_at: timestamp,
        };

        let msg_id = object::id(&sealed_msg);
        vector::push_back(&mut message_box.message_refs, msg_id);
        message_box.message_count = message_box.message_count + 1;

        event::emit(SealedMessageSent {
            profile_id,
            message_id: msg_id,
            seal_blob_id,
            sender_hash,
            is_anonymous,
            created_at: timestamp,
        });

        sealed_msg
    }

    /// Get message references from message box
    public fun get_messages(
        message_box: &MessageBox,
    ): &vector<ID> {
        &message_box.message_refs
    }

    /// Get total message count
    public fun get_message_count(
        message_box: &MessageBox,
    ): u64 {
        message_box.message_count
    }

    // ===== Seal Message Getters =====

    /// Get Seal Blob ID for decryption
    public fun get_seal_blob_id(msg: &SealedMessage): String {
        msg.seal_blob_id
    }

    /// Check if message is anonymous
    public fun is_message_anonymous(msg: &SealedMessage): bool {
        msg.is_anonymous
    }

    /// Get sender name (empty if anonymous)
    public fun get_sender_name(msg: &SealedMessage): String {
        msg.sender_name
    }

    pub fun get_message_sender_hash(msg: &SealedMessage): String {
        msg.sender_hash
    }

    pub fun get_message_created_at(msg: &SealedMessage): u64 {
        msg.created_at
    }

    pub fun get_message_profile_id(msg: &SealedMessage): ID {
        msg.profile_id
    }

    // ===== Helper Functions =====

    fun find_link_index(links: &vector<Link>, label: &String): (bool, u64) {
        let len = vector::length(links);
        let i = 0;
        while (i < len) {
            if (&vector::borrow(links, i).label == label) {
                return (true, i)
            };
            i = i + 1;
        };
        (false, 0)
    }
}
