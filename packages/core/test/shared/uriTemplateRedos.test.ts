
import { UriTemplate } from '../../src/shared/uriTemplate.js';

describe('UriTemplate ReDoS Protection', () => {
    it('should allow up to 2 greedy expressions', () => {
        const template = new UriTemplate('{+a}/{+b}');
        expect(() => template.match('/a/b')).not.toThrow();
    });

    it('should throw for more than 2 greedy expressions', () => {
        const template = new UriTemplate('{+a}/{+b}/{+c}');
        expect(() => template.match('/a/b/c')).toThrow(/Template is too complex/);
    });

    it('should allow many non-greedy expressions if separated by slash', () => {
        const template = new UriTemplate('{a}/{b}/{c}/{d}/{e}');
        // {a}: next is /. Safe.
        // {b}: next is /. Safe.
        // {c}: next is /. Safe.
        // {d}: next is /. Safe.
        // {e}: End. Unsafe.
        // Total greedy: 1.
        expect(() => template.match('/a/b/c/d/e')).not.toThrow();
    });

    it('should treat non-greedy expressions as greedy if not separated', () => {
        // {a}{b}{c} -> 3 greedy expressions -> throw
        const template = new UriTemplate('{a}{b}{c}');
        expect(() => template.match('abc')).toThrow(/Template is too complex/);
    });

    it('should treat non-greedy expressions as greedy if separated by non-safe literal', () => {
        const template = new UriTemplate('{a}-{b}-{c}');
        // '-' matches [^/,]+, so it is not a safe separator.
        // {a}, {b}, {c} are all counted as greedy. Total 3.
        expect(() => template.match('a-b-c')).toThrow(/Template is too complex/);
    });

    it('should allow mix of greedy and safe expressions', () => {
        const template = new UriTemplate('{+path}/{file}');
        // {+path}: greedy. Count=1.
        // {file}: End. Unsafe. Count=2.
        // Total 2. OK.
        expect(() => template.match('/dir/file')).not.toThrow();
    });

    it('should throw for mix exceeding limit', () => {
        const template = new UriTemplate('{+a}/{+b}/{c}');
        // {+a}: greedy. Count=1.
        // {+b}: greedy. Count=2.
        // {c}: End. Unsafe. Count=3.
        // Total 3. Throw.
        expect(() => template.match('/a/b/c')).toThrow(/Template is too complex/);
    });
});
