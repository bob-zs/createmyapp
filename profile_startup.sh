#!/bin/bash
export PS4='+ $(date "+%s.%N")\011'
export BASH_XTRACEFD=3
exec 3> /tmp/bash-startup-trace.log
bash --login -x
