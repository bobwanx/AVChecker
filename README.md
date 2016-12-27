AVChecker
=======
### Introduction

AVChecker is a dynamic analysis to make atomicity violation on AJAX-based web application which implemented on the Jalangi2. 

The detail are expressed in our paper which you can get from the 'paper' folder on this project or from the online site http://ieeexplore.ieee.org/document/7780192/.

Our paper are accepted by SATE 2016(http://software.nju.edu.cn/ise/SATE/) in Aug 23

### Requirement

Before starting with the AVChecker, we recommend you read the paper about the Jalangi https://people.eecs.berkeley.edu/~gongliang13/jalangi_ff/

and install the Jalangi2 under the related guidance from the github https://github.com/Samsung/jalangi2


### Detection

After installing the Jalangi2, you can make the detection on the web application with the AVChecker.

Our experiment work under the Jalangi instrumentation proxy model. On a Mac, AVChecker can be set and launched automatically by issuing the following command:

	./scripts/mitmproxywrapper.py --toggle --auto-disable --quiet --anticache -s "scripts/proxy.py --inlineIID --inlineSource --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/runtime/detector.js"
	