"""
Root pytest configuration and environment setup for SIH26057 Sonar backend.
Sets single-threaded BLAS to avoid Windows OpenBLAS memory fragmentation during test suites.
"""
import os

os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
