// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DIDManager is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    DIDToken public community;
    DIDToken public user;
    
    // Mapping from user token ID to community token IDs they're members of
    mapping(uint256 => uint256[]) public userMemberships;
    
    // Mapping from community token ID to member count
    mapping(uint256 => uint256) public communityMemberCount;
    
    // Mapping to check if user is member of specific community
    mapping(uint256 => mapping(uint256 => bool)) public isMember;
    
    // Mapping from community token ID to membership requirements
    mapping(uint256 => CommunityRequirements) public communityRequirements;
    
    // Mapping from user token ID to public key
    mapping(uint256 => bytes32) public userPublicKeys;
    
    // Mapping from user token ID to user profile data
    mapping(uint256 => UserProfile) public userProfiles;
    
    // Event declarations
    event UserDIDMinted(uint256 indexed tokenId, address indexed owner, bytes32 publicKey);
    event CommunityDIDMinted(uint256 indexed tokenId, address indexed owner, string name);
    event CommunityFused(uint256 indexed userTokenId, uint256 indexed communityTokenId, uint256 timestamp);
    event CommunityLeft(uint256 indexed userTokenId, uint256 indexed communityTokenId, uint256 timestamp);
    event UserProfileUpdated(uint256 indexed tokenId, string persona, uint256 xp);
    
    struct CommunityRequirements {
        uint256 minXp;
        string[] requiredBadges;
        bool isActive;
    }
    
    struct UserProfile {
        string persona;
        uint256 xp;
        uint256 level;
        string[] badges;
        uint256 createdAt;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Deploy user and community DID tokens
        user = new DIDToken("User DID", "UDID", address(this));
        community = new DIDToken("Community DID", "CDID", address(this));
    }
    
    /**
     * @dev Mint a new User DID NFT
     * @param tokenId Unique identifier for the token
     * @param to Address to mint the token to
     * @param publicKey Public key associated with this DID
     * @param persona User's persona/role
     */
    function mintUserDID(
        uint256 tokenId, 
        address to, 
        bytes32 publicKey, 
        string memory persona
    ) external onlyRole(MINTER_ROLE) {
        user.mint(tokenId, to);
        userPublicKeys[tokenId] = publicKey;
        
        // Initialize user profile
        userProfiles[tokenId] = UserProfile({
            persona: persona,
            xp: 0,
            level: 1,
            badges: new string[](0),
            createdAt: block.timestamp
        });
        
        emit UserDIDMinted(tokenId, to, publicKey);
    }
    
    /**
     * @dev Mint a new Community DID NFT
     * @param tokenId Unique identifier for the token
     * @param to Address to mint the token to
     * @param name Community name
     * @param minXp Minimum XP required to join
     * @param requiredBadges Array of required badges to join
     */
    function mintCommunityDID(
        uint256 tokenId, 
        address to, 
        string memory name,
        uint256 minXp,
        string[] memory requiredBadges
    ) external onlyRole(MINTER_ROLE) {
        community.mint(tokenId, to);
        
        // Set community requirements
        communityRequirements[tokenId] = CommunityRequirements({
            minXp: minXp,
            requiredBadges: requiredBadges,
            isActive: true
        });
        
        emit CommunityDIDMinted(tokenId, to, name);
    }
    
    /**
     * @dev Fuse user with community (join community)
     * @param userTokenId User's DID token ID
     * @param communityTokenId Community's DID token ID
     */
    function fuseWithCommunity(uint256 userTokenId, uint256 communityTokenId) external {
        // Verify user owns the user DID token
        require(user.ownerOf(userTokenId) == msg.sender, "Not owner of user DID");
        
        // Verify community DID exists
        require(community.ownerOf(communityTokenId) != address(0), "Community DID does not exist");
        
        // Verify user is not already a member
        require(!isMember[userTokenId][communityTokenId], "Already a member");
        
        // Check community requirements
        require(_meetsRequirements(userTokenId, communityTokenId), "Does not meet community requirements");
        
        // Add user to community
        userMemberships[userTokenId].push(communityTokenId);
        isMember[userTokenId][communityTokenId] = true;
        communityMemberCount[communityTokenId]++;
        
        // Award XP for joining community
        userProfiles[userTokenId].xp += 10;
        _updateUserLevel(userTokenId);
        
        emit CommunityFused(userTokenId, communityTokenId, block.timestamp);
    }
    
    /**
     * @dev Leave a community
     * @param userTokenId User's DID token ID
     * @param communityTokenId Community's DID token ID
     */
    function leaveCommunity(uint256 userTokenId, uint256 communityTokenId) external {
        require(user.ownerOf(userTokenId) == msg.sender, "Not owner of user DID");
        require(isMember[userTokenId][communityTokenId], "Not a member");
        
        // Remove from membership
        isMember[userTokenId][communityTokenId] = false;
        communityMemberCount[communityTokenId]--;
        
        // Remove from user's membership list
        uint256[] storage memberships = userMemberships[userTokenId];
        for (uint256 i = 0; i < memberships.length; i++) {
            if (memberships[i] == communityTokenId) {
                memberships[i] = memberships[memberships.length - 1];
                memberships.pop();
                break;
            }
        }
        
        emit CommunityLeft(userTokenId, communityTokenId, block.timestamp);
    }
    
    /**
     * @dev Add badge to user
     * @param userTokenId User's DID token ID
     * @param badge Badge name to add
     */
    function addBadgeToUser(uint256 userTokenId, string memory badge) external onlyRole(ADMIN_ROLE) {
        require(user.ownerOf(userTokenId) != address(0), "User DID does not exist");
        userProfiles[userTokenId].badges.push(badge);
    }
    
    /**
     * @dev Update user XP
     * @param userTokenId User's DID token ID
     * @param xpToAdd XP amount to add
     */
    function addXPToUser(uint256 userTokenId, uint256 xpToAdd) external onlyRole(ADMIN_ROLE) {
        require(user.ownerOf(userTokenId) != address(0), "User DID does not exist");
        userProfiles[userTokenId].xp += xpToAdd;
        _updateUserLevel(userTokenId);
        
        emit UserProfileUpdated(userTokenId, userProfiles[userTokenId].persona, userProfiles[userTokenId].xp);
    }
    
    /**
     * @dev Update community requirements
     * @param communityTokenId Community's DID token ID
     * @param minXp New minimum XP requirement
     * @param requiredBadges New required badges
     */
    function updateCommunityRequirements(
        uint256 communityTokenId, 
        uint256 minXp, 
        string[] memory requiredBadges
    ) external {
        require(community.ownerOf(communityTokenId) == msg.sender, "Not community owner");
        
        communityRequirements[communityTokenId] = CommunityRequirements({
            minXp: minXp,
            requiredBadges: requiredBadges,
            isActive: true
        });
    }
    
    /**
     * @dev Get user memberships
     * @param userTokenId User's DID token ID
     * @return Array of community token IDs user is member of
     */
    function getUserMemberships(uint256 userTokenId) external view returns (uint256[] memory) {
        return userMemberships[userTokenId];
    }
    
    /**
     * @dev Get user profile
     * @param userTokenId User's DID token ID
     * @return UserProfile struct
     */
    function getUserProfile(uint256 userTokenId) external view returns (UserProfile memory) {
        return userProfiles[userTokenId];
    }
    
    /**
     * @dev Get user badges
     * @param userTokenId User's DID token ID
     * @return Array of badge names
     */
    function getUserBadges(uint256 userTokenId) external view returns (string[] memory) {
        return userProfiles[userTokenId].badges;
    }
    
    /**
     * @dev Get public key for user DID
     * @param userTokenId User's DID token ID
     * @return Public key bytes32
     */
    function getPublicKey(uint256 userTokenId) external view returns (bytes32) {
        return userPublicKeys[userTokenId];
    }
    
    /**
     * @dev Estimate gas for community fusion
     * @param userTokenId User's DID token ID
     * @param communityTokenId Community's DID token ID
     * @return Estimated gas cost
     */
    function estimateGasForFusion(uint256 userTokenId, uint256 communityTokenId) external view returns (uint256) {
        // Check if tokens exist without reverting
        try user.ownerOf(userTokenId) returns (address userOwner) {
            if (userOwner == address(0)) return 0;
        } catch {
            return 0; // User token doesn't exist
        }
        
        try community.ownerOf(communityTokenId) returns (address communityOwner) {
            if (communityOwner == address(0)) return 0;
        } catch {
            return 0; // Community token doesn't exist
        }
        
        if (isMember[userTokenId][communityTokenId]) {
            return 0; // Already a member
        }
        
        if (!_meetsRequirements(userTokenId, communityTokenId)) {
            return 0; // Doesn't meet requirements
        }
        
        return 50000; // Estimated gas for fusion operation
    }
    
    /**
     * @dev Get community requirements (for external access)
     * @param communityTokenId Community's DID token ID
     * @return minXp Minimum XP required
     * @return requiredBadges Array of required badge names
     * @return isActive Whether the community is active
     */
    function getCommunityRequirements(uint256 communityTokenId) external view returns (
        uint256 minXp, 
        string[] memory requiredBadges, 
        bool isActive
    ) {
        CommunityRequirements memory requirements = communityRequirements[communityTokenId];
        return (requirements.minXp, requirements.requiredBadges, requirements.isActive);
    }
    
    /**
     * @dev Check if user meets community requirements
     * @param userTokenId User's DID token ID
     * @param communityTokenId Community's DID token ID
     * @return Boolean indicating if requirements are met
     */
    function _meetsRequirements(uint256 userTokenId, uint256 communityTokenId) internal view returns (bool) {
        CommunityRequirements memory requirements = communityRequirements[communityTokenId];
        
        if (!requirements.isActive) {
            return false;
        }
        
        UserProfile memory profile = userProfiles[userTokenId];
        
        // Check XP requirement
        if (profile.xp < requirements.minXp) {
            return false;
        }
        
        // Check badge requirements
        for (uint256 i = 0; i < requirements.requiredBadges.length; i++) {
            bool hasBadge = false;
            for (uint256 j = 0; j < profile.badges.length; j++) {
                if (keccak256(bytes(requirements.requiredBadges[i])) == keccak256(bytes(profile.badges[j]))) {
                    hasBadge = true;
                    break;
                }
            }
            if (!hasBadge) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Update user level based on XP
     * @param userTokenId User's DID token ID
     */
    function _updateUserLevel(uint256 userTokenId) internal {
        uint256 xp = userProfiles[userTokenId].xp;
        // Simple leveling system: level = sqrt(xp/100) + 1
        uint256 newLevel = (sqrt(xp / 100)) + 1;
        userProfiles[userTokenId].level = newLevel;
    }
    
    /**
     * @dev Integer square root function
     * @param x Number to find square root of
     * @return Square root of x
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    /**
     * @dev Grant minter role to address
     * @param minter Address to grant minter role
     */
    function grantMinterRole(address minter) external onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }
    
    /**
     * @dev Revoke minter role from address
     * @param minter Address to revoke minter role from
     */
    function revokeMinterRole(address minter) external onlyRole(ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
    }
}

contract DIDToken is ERC721, Ownable {
    error TokenNotTransferable();
    
    address public didManager;
    string private _baseTokenURI;
    
    // Mapping from token ID to metadata URI
    mapping(uint256 => string) private _tokenURIs;
    
    constructor(
        string memory _name, 
        string memory _symbol, 
        address _didManager
    ) Ownable(msg.sender) ERC721(_name, _symbol) {
        didManager = _didManager;
    }
    
    /**
     * @dev Mint new token - only callable by DID manager
     * @param tokenId Token ID to mint
     * @param to Address to mint token to
     */
    function mint(uint256 tokenId, address to) external {
        require(msg.sender == didManager, "Only DID manager can mint");
        _mint(to, tokenId);
    }
    
    /**
     * @dev Set token URI for specific token
     * @param tokenId Token ID
     * @param uri Metadata URI
     */
    function setTokenURI(uint256 tokenId, string memory uri) external {
        require(msg.sender == didManager, "Only DID manager can set URI");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _tokenURIs[tokenId] = uri;
    }
    
    /**
     * @dev Set base URI for all tokens
     * @param baseURI Base URI string
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Get token URI
     * @param tokenId Token ID
     * @return Token metadata URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        
        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
        
        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        
        return string(abi.encodePacked(base, Strings.toString(tokenId)));
    }
    
    /**
     * @dev Returns the base URI for tokens
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Override transfer functions to make tokens non-transferable
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) but not transfers
        if (from != address(0) && to != address(0)) {
            revert TokenNotTransferable();
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Override approve functions to prevent approvals since tokens are non-transferable
     */
    function approve(address, uint256) public pure override {
        revert TokenNotTransferable();
    }
    
    /**
     * @dev Override setApprovalForAll to prevent approvals since tokens are non-transferable
     */
    function setApprovalForAll(address, bool) public pure override {
        revert TokenNotTransferable();
    }
    
    /**
     * @dev Override getApproved to always return zero address since no approvals allowed
     */
    function getApproved(uint256) public pure override returns (address) {
        return address(0);
    }
    
    /**
     * @dev Override isApprovedForAll to always return false since no approvals allowed
     */
    function isApprovedForAll(address, address) public pure override returns (bool) {
        return false;
    }
}