// PrologWorker.js

importScripts('my-tau-prolog.js');

let prologReady = false;

var kb = ":- use_module(library(lists)). :- use_module(library(js)).";

kb += "connected(T,N,M):- member(T,M,N,_);member(T,M,_,N).";
kb += "node(T,N):- member(node(N,_,_),T).";
kb += "member(T,M,I,J):- member(member(M,I,J),T).";
kb += "support(T,N,P):- member(support(P,N),T).";
kb += "free(T,N,R):- node(T,N), (member(support(_,N),T);member(load(N,_),T)), R = false,!; node(T,N), \\+  member(support(_,N),T), \\+ member(load(N,_),T), R= true.";

kb += "subtract_element(_, [], []).";
kb += "subtract_element(Elem, [Elem|Tail], Tail).";
kb += "subtract_element(Elem, [Head|Tail], [Head|Result]) :- Elem \\= Head,subtract_element(Elem, Tail, Result).";

kb += "simplify2(T,N,[M1,M2],Q):- subtract_element(node(N,_,_),T,Q1), subtract_element(member(M1,_,_),Q1,Q2), subtract_element(member(M2,_,_),Q2,Q).";
kb += "simplify1(T,M,Q):- subtract_element(member(M,_,_),T,Q).";
kb += "simplify3(T,N,M,Q):- subtract_element(node(N,_,_),T,Q1), subtract_element(member(M,_,_),Q1,Q).";

kb += "cardinality(T,N,C):- node(T,N), setof(X,(connected(T,N,X)),L), length(L,C).";
kb += "collinear(T,M1,M2):- member(T,M1,I,J), member(node(I,X0,Y0),T), member(node(J,X1,Y1),T),member(T,M2,II,JJ), member(node(II,XX0,YY0),T), member(node(JJ,XX1,YY1),T), DXY1 is (X1 - X0)*(YY1-YY0), DXY2 is (Y1-Y0)*(XX1-XX0), Delta is DXY1 - DXY2, Delta = 0,!.";

kb += "hasnode(T,M,N):- member(T,M,I,J), (I = N; J = N).";
kb += "ishorizontal(T,M):- member(T,M,N1,N2),member(node(N1,X0,Y0),T),member(node(N2,X1,Y1),T), Y0 = Y1.";
kb += "nothorizontal(T,M,R):- ishorizontal(T,M), R = false;  \\+ ishorizontal(T,M), R = true.";
kb += "isvertical(T,M):- member(T,M,N1,N2),member(node(N1,X0,Y0),T),member(node(N2,X1,Y1),T), X0 = X1.";
kb += "notvertical(T,M,R):- isvertical(T,M), R = false;  \\+ isvertical(T,M), R = true.";
kb += "hasrollerx(T,N):- node(T,N), member(support(rollerx,N),T).";
kb += "hasrollery(T,N):- node(T,N), member(support(rollery,N),T).";
kb += "hasloadx(T,N):- node(T,N), member(load(N,x),T).";
kb += "hasloady(T,N):- node(T,N), member(load(N,y),T).";
kb += "noloadx(T,N,R):- node(T,N), member(load(N,x),T), R = false; node(T,N), \\+ member(load(N,x),T), R = true.";
kb += "noloady(T,N,R):- node(T,N), member(load(N,y),T), R = false; node(T,N), \\+ member(load(N,y),T), R = true.";
kb += "noload(T,N):- noloadx(T,N,true), noloady(T,N,true).";
kb += "nosupport(T,N,R):- node(T,N), member(support(_,N),T), R = false; node(T,N), \\+ member(support(_,N),T), R = true.";
// Rule 1: two noncollinear members at a node with no support or load
kb += "rule1(T,N):- cardinality(T,N,2), free(T,N,true), hasnode(T,M1,N), hasnode(T,M2,N), M1 \\= M2, \\+ collinear(T,M1,M2).";
// Rule 2: two collinear members and a noncollinear member at the node. No support or load applied to the node.
kb += "rule2(T,N,M3):- cardinality(T,N,3), free(T,N,true), hasnode(T,M1,N), hasnode(T,M2,N), hasnode(T,M3,N), M1 \\= M2, M1 \\= M3, M2 \\= M3, collinear(T,M1,M2), !.";
// Rule 3: a node with no support or load having one member attached to it.
kb += "rule3(T,N,M):- cardinality(T,N,1), free(T,N,true), hasnode(T,M,N).";
//Rule 4: a member having a pin support at each end.
kb += "rule4(T,M):- hasnode(T,M,N1), hasnode(T,M,N2), N1 \\= N2, support(T,N1,pin), support(T,N2,pin).";
// Rule 5: a single horizontal member resting on a horizontal roller subjected to no horizontal load.
kb += "rule5(T,N,M):- cardinality(T,N,1), hasrollerx(T,N), hasnode(T,M,N), ishorizontal(T,M), noloadx(T,N,true).";
// Rule 6: a single member resting or a horizontal roller subjected to no load.
kb += "rule6(T,N,M):- cardinality(T,N,1), hasrollerx(T,N), noload(T,N), notvertical(T,M,true), hasnode(T,M,N).";
// Rule 7: a single member resting on a vertical roller subjected to a no vertical load.
kb += "rule7(T,N,M):- cardinality(T,N,1), hasrollery(T,N), noloady(T,N,true), hasnode(T,M,N), isvertical(T,M).";
// Rule 8: a single member resting on a vertical roller subjected to no load.
kb += "rule8(T,N,M):- cardinality(T,N,1), hasrollery(T,N), nothorizontal(T,M,true), noload(T,N), hasnode(T,M,N).";
// Rule 9: Two members one vertical and one horizontal resting on a horizontal roller with no load in that direction.
kb += "rule9(T,N,M):- cardinality(T,N,2), hasrollerx(T,N), noloadx(T,N,true), hasnode(T,M,N), hasnode(T,M2,N), M \\= M2, ishorizontal(T,M), isvertical(T,M2).";
// Rule 10: Two members one vertical and one horizontal resting on a vertical roller with no load in the vertical direction.
kb += "rule10(T,N,M):- cardinality(T,N,2), hasrollery(T,N), noloady(T,N,true), hasnode(T,M,N), hasnode(T,M2,N), M \\= M2, ishorizontal(T,M2), isvertical(T,M).";
// Rule 11: Two members one horizontal and one non-horizontal with no support but a load in the horizontal direction.
kb += "rule11(T,N,M):- cardinality(T,N,2), nosupport(T,N,true), hasloadx(T,N),noloady(T,N,true), hasnode(T,M1,N), hasnode(T,M,N), ishorizontal(T,M1), nothorizontal(T,M,true),M \\= M1.";
// Rule 12: Two members one vertical and one non-vertical with no support but a load in the horizontal direction.
kb += "rule12(T,N,M):- cardinality(T,N,2), nosupport(T,N,true), hasloady(T,N),noloadx(T,N,true), hasnode(T,M1,N), hasnode(T,M,N), isvertical(T,M1), notvertical(T,M,true),M \\= M1.";

kb += "zfm1(T,Q):- rule1(T,N), setof(X,(connected(T,N,X)),[M1,M2]),assertz(zf(M1)),assertz(zf(M2)), nsteps(K), L is K + 1, retractall(nsteps(_)),assertz(nsteps(L)), assertz(step(L,1,T,N,[M1,M2])),simplify2(T,N,[M1,M2],Q),!.";
kb += "zfm2(T,Q):- rule2(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,2,T,N,[M])), simplify1(T,M,Q),!.";
kb += "zfm3(T,Q):- rule3(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,3,T,N,[M])), simplify3(T,N,M,Q),!.";
kb += "zfm4(T,Q):- rule4(T,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,4,T,_,[M])), simplify1(T,M,Q),!.";
kb += "zfm5(T,Q):- rule5(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,5,T,N,[M])), simplify3(T,N,M,Q),!.";
kb += "zfm6(T,Q):- rule6(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,6,T,N,[M])), simplify3(T,N,M,Q),!.";
kb += "zfm7(T,Q):- rule7(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,7,T,N,[M])), simplify1(T,M,Q),!.";
kb += "zfm8(T,Q):- rule8(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,8,T,N,[M])), simplify1(T,M,Q),!.";
kb += "zfm9(T,Q):- rule9(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,9,T,N,[M])), simplify1(T,M,Q),!.";
kb += "zfm10(T,Q):- rule10(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,10,T,N,[M])), simplify1(T,M,Q),!.";
kb += "zfm11(T,Q):- rule11(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,11,T,N,[M])), simplify1(T,M,Q),!.";
kb += "zfm12(T,Q):- rule12(T,N,M), assertz(zf(M)), nsteps(K), L is K + 1, retractall(nsteps(_)), assertz(nsteps(L)), assertz(step(L,12,T,N,[M])), simplify1(T,M,Q),!.";
kb += "zfm(T,Q):- zfm1(T,Q), !; zfm2(T,Q),!; zfm3(T,Q),!; zfm4(T,Q),!; zfm5(T,Q),!; zfm6(T,Q),!; zfm7(T,Q),!; zfm8(T,Q),!; zfm9(T,Q),!; zfm10(T,Q),!; zfm11(T,Q), !; zfm12(T,Q).";

kb += "norule1(T,E):- rule1(T,N), E=false, !; E=true.";
kb += "norule2(T,E):- rule2(T,N,_), E=false, !; E=true.";
kb += "norule3(T,E):- rule3(T,N,_), E=false, !; E=true.";
kb += "norule4(T,E):- rule4(T,M), E=false, !; E=true.";
kb += "norule5(T,E):- rule5(T,N,_), E=false, !; E = true.";
kb += "norule6(T,E):- rule6(T,N,_), E=false, !; E = true.";
kb += "norule7(T,E):- rule7(T,N,_), E=false, !; E = true.";
kb += "norule8(T,E):- rule8(T,N,_), E=false, !; E = true.";
kb += "norule9(T,E):- rule9(T,N,_), E=false, !; E = true.";
kb += "norule10(T,E):- rule10(T,N,_), E=false, !; E = true.";
kb += "norule11(T,E):- rule11(T,N,_), E=false, !; E = true.";
kb += "norule12(T,E):- rule12(T,N,_), E=false, !; E = true.";
kb += "norule(T,E1,E2,E3,E4,E5,E6,E7,E9,E8,E10,E11,E12):- norule1(T,E1), norule2(T,E2), norule3(T,E3), norule4(T,E4), norule5(T,E5), norule6(T,E6),norule7(T,E7), norule8(T,E8), norule9(T,E9), norule10(T,E10), norule11(T,E11), norule12(T,E12).";
kb += "norule(T):- norule(T,E1,E2,E3,E4,E5,E6,E7,E8,E9,E10,E11,E12), E1=true, E2 = true, E3 = true, E4 = true, E5 = true, E6 = true, E7 = true, E8 = true, E9 = true, E10 = true, E11 = true, E12 = true, !; fail.";

kb += "zeroforce(T,T):- norule(T),!.";
kb += "zeroforce(T,M):- zfm(T,Q), zeroforce(Q,M).";

var G = '';
var StepCounter = 0;
let triggerFlag = false;
let goalSuccess = false;

var session = pl.create();

const program = kb;  
session.consult(program, {success: function() {}});

var X = async function Answer(X){
var One = X.toString();
//console.log('one answer>: '+One);
G += One;
}

function process(Truss) {
  //  Truss = '[node(1,8,1),node(2,8,4),node(3,15,1),member(1,1,3),member(2,2,3),support(pin,3),support(rollerx,2),load(1,x)]';
   var goal = "retractall(zf(_)), retractall(nsteps(_)), retractall(step(_,_,_,_,_)), assertz(nsteps(0)), zeroforce("+Truss+",_). nsteps(Y). (nsteps(0),!;step(S,R,T,N,L)).";
 //  var goal = "retractall(zf(_)), retractall(nsteps(_)), retractall(step(_,_,_,_,_)), assertz(nsteps(0)), zfm6("+Truss+",Q). nsteps(Y). (nsteps(0),!;step(S,R,T,N,L)).";  

    G = '';
    session.query(goal, {
        success: function() {
            session.answers(X);
        },
    })
    triggerFlag = true;   
   
}


// Initialization or Preprocessing Code
function initialize() {
    // Any preprocessing steps you need

    prologReady = true;
}

self.addEventListener('message', function(e) {
    if (e.data.command === 'initialize') {
        initialize();
        self.postMessage({ status: 'initialized' });
    } else if (e.data.command === 'calculate' && prologReady) {
        G = '';
        console.log('input truss: '+e.data.truss);
        process(e.data.truss);

        function sendResult(){
            console.log('output truss: '+G);
            self.postMessage({ result: G});
        }

    function pollTriggerFlag() {
        if (triggerFlag === true) {
            sendResult();
            clearInterval(pollingInterval); // Stop polling once the condition is met
        }
    }
    const pollingInterval = setInterval(pollTriggerFlag, 1000); 
}
});

