import { CHILD_SERVER } from './constants';

const htmlSrc = `
<!DOCTYPE html>
<html>
  <body>
    <script type="text/javascript" src="${CHILD_SERVER}/penpal.js"></script>
    <script type="text/javascript">
      Penpal.connectToParent({
        methods: {
          multiply: function(num1, num2) {
            return num1 * num2;
          }
        }
      });
    </script>
  </body>
</html>
`;

const htmlSrcRedirect = `
<!DOCTYPE html>
<html>
  <head>
    <script>
      document.location = '${CHILD_SERVER}/child.html'
    </script>
  </head>
</html>
`;

describe('data URI support', () => {
  it('connects and calls a function on the child', done => {
    const connection = Penpal.connectToChild({
      src: `data:text/html,${htmlSrc}`
    });

    connection.promise.then(child => {
      child.multiply(2, 5).then(value => {
        expect(value).toEqual(10);
        connection.destroy();
        done();
      });
    });
  });

  it('does not connect if child redirects to non-opaque origin', done => {
    const connection = Penpal.connectToChild({
      src: `data:text/html,${htmlSrcRedirect}`
    });

    const connectionResolved = jasmine.createSpy().and.callFake(() => {
      connection.destroy();
    });

    connection.promise.then(connectionResolved);

    setTimeout(() => {
      expect(connectionResolved).not.toHaveBeenCalled();
      done();
    }, 200);
  });
});

var supportsSrcDoc = !!('srcdoc' in document.createElement('iframe'));

if (supportsSrcDoc) {
  describe('srcdoc support', () => {
    it('connects and calls a function on the child', done => {
      const connection = Penpal.connectToChild({
        srcdoc: htmlSrc
      });

      connection.promise.then(child => {
        child.multiply(2, 5).then(value => {
          expect(value).toEqual(10);

          setTimeout(() => {
            connection.destroy();
            done();
          }, 500);
        });
      });
    });

    it('does not connect if child redirects to non-opaque origin', done => {
      const connection = Penpal.connectToChild({
        srcdoc: htmlSrcRedirect
      });

      const connectionResolved = jasmine.createSpy().and.callFake(() => {
        connection.destroy();
      });

      connection.promise.then(connectionResolved);

      setTimeout(() => {
        expect(connectionResolved).not.toHaveBeenCalled();
        done();
      }, 200);
    });
  });
}