import struct

class CustomSHA256:
   
    
    # SHA-256 constants
    K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]
    
    H = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]
    
    @staticmethod
    def _right_rotate(value, amount):
        return ((value >> amount) | (value << (32 - amount))) & 0xffffffff
    
    @staticmethod
    def _right_shift(value, amount):
        return value >> amount
    
    @staticmethod
    def _preprocess(message):
        msg_bytes = message.encode('utf-8') if isinstance(message, str) else message
        msg_len_bits = len(msg_bytes) * 8
        msg_bytes = bytearray(msg_bytes)
        msg_bytes.append(0x80)
        
        while (len(msg_bytes) * 8) % 512 != 448:
            msg_bytes.append(0x00)
        
        msg_bytes.extend(struct.pack('>Q', msg_len_bits))
        return bytes(msg_bytes)
    
    @classmethod
    def _process_block(cls, block, hash_values):
        w = list(struct.unpack('>16I', block))
        
        for i in range(16, 64):
            s0 = (cls._right_rotate(w[i-15], 7) ^ cls._right_rotate(w[i-15], 18) ^ cls._right_shift(w[i-15], 3))
            s1 = (cls._right_rotate(w[i-2], 17) ^ cls._right_rotate(w[i-2], 19) ^ cls._right_shift(w[i-2], 10))
            w.append((w[i-16] + s0 + w[i-7] + s1) & 0xffffffff)
        
        a, b, c, d, e, f, g, h = hash_values
        
        for i in range(64):
            S1 = (cls._right_rotate(e, 6) ^ cls._right_rotate(e, 11) ^ cls._right_rotate(e, 25))
            ch = (e & f) ^ (~e & g)
            temp1 = (h + S1 + ch + cls.K[i] + w[i]) & 0xffffffff
            
            S0 = (cls._right_rotate(a, 2) ^ cls._right_rotate(a, 13) ^ cls._right_rotate(a, 22))
            maj = (a & b) ^ (a & c) ^ (b & c)
            temp2 = (S0 + maj) & 0xffffffff
            
            h, g, f, e, d, c, b, a = g, f, e, (d + temp1) & 0xffffffff, c, b, a, (temp1 + temp2) & 0xffffffff
        
        hash_values[0] = (hash_values[0] + a) & 0xffffffff
        hash_values[1] = (hash_values[1] + b) & 0xffffffff
        hash_values[2] = (hash_values[2] + c) & 0xffffffff
        hash_values[3] = (hash_values[3] + d) & 0xffffffff
        hash_values[4] = (hash_values[4] + e) & 0xffffffff
        hash_values[5] = (hash_values[5] + f) & 0xffffffff
        hash_values[6] = (hash_values[6] + g) & 0xffffffff
        hash_values[7] = (hash_values[7] + h) & 0xffffffff
    
    @classmethod
    def hash(cls, message):
        preprocessed = cls._preprocess(message)
        hash_values = list(cls.H)
        
        for i in range(0, len(preprocessed), 64):
            cls._process_block(preprocessed[i:i+64], hash_values)
        
        return ''.join(f'{h:08x}' for h in hash_values)
    
    @classmethod
    def verify(cls, message, known_hash):
        computed_hash = cls.hash(message)
        return computed_hash == known_hash


class VotingHasher:
    """Custom hashing for voting system"""
    
    @staticmethod
    def hash_voter_id(voter_id: str) -> str:
        return CustomSHA256.hash(voter_id)
    
    @staticmethod
    def hash_vote(voter_id: str, candidate_id: int, timestamp: str) -> str:
        vote_data = f"{voter_id}:{candidate_id}:{timestamp}"
        return CustomSHA256.hash(vote_data)
    
    @staticmethod
    def hash_candidate(candidate_id: int, name: str, party: str) -> str:
        candidate_data = f"{candidate_id}:{name}:{party}"
        return CustomSHA256.hash(candidate_data)
    
    @staticmethod
    def hash_block(index: int, timestamp: str, data: str, previous_hash: str) -> str:
        block_data = f"{index}:{timestamp}:{data}:{previous_hash}"
        return CustomSHA256.hash(block_data)
    
    @staticmethod
    def hash_election_results(total_votes: int, results: str) -> str:
        election_data = f"{total_votes}:{results}"
        return CustomSHA256.hash(election_data)
    
    @staticmethod
    def verify_vote(voter_id: str, candidate_id: int, timestamp: str, vote_hash: str) -> bool:
        vote_data = f"{voter_id}:{candidate_id}:{timestamp}"
        return CustomSHA256.verify(vote_data, vote_hash)




if __name__== '__main__':
    hsah_algo = CustomSHA256()
    print(hsah_algo.hash("Hello, World!"))